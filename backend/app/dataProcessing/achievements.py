from enum import StrEnum


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

    return unlocked

# tuple can make us to return both the new streaks and the list of unlocked player IDs in a single return statement.
def update_correct_answer_progress(
    previous_streaks: dict[str, int],
    previous_totals: dict[str, int],
    player_stats: dict[str, dict],
) -> tuple[dict[str, int], dict[str, int], dict[str, list[AchievementCode]]]:
    streaks = {}
    totals = {}
    unlocked = {}

    for player_id, stats in player_stats.items():
        correct = stats.get("correct_votes", 0) == 1

        streaks[player_id] = (
            previous_streaks.get(player_id, 0) + 1
            if correct else 0
        )
        totals[player_id] = (
            previous_totals.get(player_id, 0)
            + int(correct)
        )

        if streaks[player_id] == 5:
            unlocked.setdefault(player_id, []).append(
                AchievementCode.TRUTH_SEEKER
            )

        if totals[player_id] == 10:
            unlocked.setdefault(player_id, []).append(
                AchievementCode.EINSTEIN
            )

    return streaks, totals, unlocked
# streaks == {"u1": 5, "u2": 0}
# unlocked == ["u1"]
# totals == {"u1": 10, "u2": 2}