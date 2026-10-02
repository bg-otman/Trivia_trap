from enum import StrEnum


def evaluate_historical_achievements(*, completed_games: int, wins: int,
                                     points: int, bluff_votes: int) -> list["AchievementCode"]:
    thresholds = (
        (completed_games, 30, AchievementCode.VETERAN),
        (wins, 1, AchievementCode.FIRST_VICTORY),
        (wins, 10, AchievementCode.CHAMPION),
        (points, 100, AchievementCode.MESSSSI),
        (bluff_votes, 25, AchievementCode.DECEPTION_MASTER),
    )
    return [code for value, threshold, code in thresholds if value >= threshold]


def evaluate_collector(codes: set[str]) -> list["AchievementCode"]:
    other_codes = set(codes) & {code.value for code in AchievementCode if code != AchievementCode.COLLECTOR}
    return [AchievementCode.COLLECTOR] if len(other_codes) >= 10 else []


class AchievementCode(StrEnum):
    BLUFFER = "BLUFFER"
    EINSTEIN = "EINSTEIN"
    REMONTADA_MASTER = "REMONTADA_MASTER"
    TRUTH_SEEKER = "TRUTH_SEEKER"
    DECEPTION_MASTER = "DECEPTION_MASTER"
    ON_FIRE = "ON_FIRE"
    LONE_GENIUS = "LONE_GENIUS"
    PERFECT_TRAP = "PERFECT_TRAP"
    COLLECTOR = "COLLECTOR"
    FIRST_VICTORY = "FIRST_VICTORY"
    CHAMPION = "CHAMPION"
    VETERAN = "VETERAN"
    MESSSSI = "MESSSSI"

def evaluate_round_achievements(
    player_stats: dict[str, dict],
    choices_by_id: dict[str, dict] | None = None,
) -> dict[str, list[AchievementCode]]:
    unlocked = {}

    for player_id, stats in player_stats.items():
        if stats.get("bluff_votes_received", 0) >= 4:
            unlocked.setdefault(player_id, []).append(
                AchievementCode.BLUFFER
            )

    correct_players = [
        player_id
        for player_id, stats in player_stats.items()
        if stats.get("correct_votes", 0) == 1
    ]

    if len(correct_players) == 1:
        player_id = correct_players[0]

        unlocked.setdefault(player_id, []).append(
            AchievementCode.LONE_GENIUS
        )

    if choices_by_id is not None:
        player_ids = set(player_stats)
        for choice in choices_by_id.values():
            if choice["is_correct"] or not choice["author_ids"]:
                continue

            authors = set(choice["author_ids"]) & player_ids
            eligible_voters = player_ids - set(choice["author_ids"])
            if (
                authors
                and eligible_voters
                and set(choice["voter_ids"]) == eligible_voters
            ):
                for author_id in authors:
                    unlocked.setdefault(author_id, []).append(
                        AchievementCode.PERFECT_TRAP
                    )

    return unlocked


def update_correct_answer_progress(
    previous_streaks: dict[str, int],
    already_announced: set[str],
    player_stats: dict[str, dict],
    previous_totals: dict[str, int],
    einstein_already_announced: set[str],
) -> tuple[
    dict[str, int],
    set[str],
    dict[str, int],
    set[str],
    dict[str, list[AchievementCode]],
]:
    """Update independent match streaks and totals, announcing each award once."""
    streaks = {}
    announced = already_announced.copy()
    totals = previous_totals.copy()
    einstein_announced = einstein_already_announced.copy()
    unlocked = {}

    for player_id, stats in player_stats.items():
        correct = stats.get("correct_votes", 0) == 1

        streaks[player_id] = (
            previous_streaks.get(player_id, 0) + 1
            if correct else 0
        )
        totals[player_id] = previous_totals.get(player_id, 0) + int(correct)
        if streaks[player_id] >= 5 and player_id not in announced:
            unlocked.setdefault(player_id, []).append(
                AchievementCode.TRUTH_SEEKER
            )
            announced.add(player_id)

        if correct and totals[player_id] >= 10 and player_id not in einstein_announced:
            unlocked.setdefault(player_id, []).append(
                AchievementCode.EINSTEIN
            )
            einstein_announced.add(player_id)

    return streaks, announced, totals, einstein_announced, unlocked


def update_on_fire_progress(
    players: dict[str, "PlayerInfo"],
    player_stats: dict[str, dict],
) -> None:
    """A zero-point round permanently removes eligibility for this match."""
    for player_id, player in players.items():
        if getattr(player, "on_fire_eligible", False):
            player.on_fire_eligible = player_stats[player_id]["round_points"] >= 1


def evaluate_on_fire_achievements(
    players: dict[str, "PlayerInfo"],
) -> dict[str, list[AchievementCode]]:
    """Evaluate only the players still in the room at the actual match end."""
    return {
        player_id: [AchievementCode.ON_FIRE]
        for player_id, player in players.items()
        if getattr(player, "on_fire_eligible", False)
    }


def capture_remontada_midpoint(players: dict[str, "PlayerInfo"]) -> set[str]:
    """Snapshot the lowest cumulative scores after the midpoint round is scored."""
    if not players:
        return set()
    scores = [player.score for player in players.values()]
    lowest = min(scores)
    if lowest == max(scores):
        return set()
    return {player_id for player_id, player in players.items() if player.score == lowest}


def evaluate_remontada_achievements(
    players: dict[str, "PlayerInfo"],
    midpoint_last_player_ids: set[str] | None,
    winning_score: int | None,
) -> dict[str, list[AchievementCode]]:
    """Resolve the existing final podium's winner by score and ID, never by name."""
    if not midpoint_last_player_ids or winning_score is None:
        return {}
    winners = [pid for pid, player in players.items() if player.score == winning_score]
    # A departed winner must not turn the runner-up into an achievement winner.
    if len(winners) != 1:
        return {}
    winner_id = winners[0]
    if winner_id in midpoint_last_player_ids and getattr(players[winner_id], "remontada_eligible", False):
        return {winner_id: [AchievementCode.REMONTADA_MASTER]}
    return {}
