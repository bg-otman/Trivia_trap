def evaluate_round_achievements(
    player_stats: dict[str, dict],
    choices_by_id: dict[str, dict],
    player_ids: set[str],
    already_unlocked: dict[str, set[str]],
) -> dict[str, list[str]]:
    newly_unlocked = {}
    perfect_bluff_authors = set()

    if len(player_ids) >= 3:
        for choice in choices_by_id.values():
            if choice["is_correct"]:
                continue

            authors = set(choice["author_ids"]) & player_ids
            eligible_voters = player_ids - authors
            valid_voters = set(choice["voter_ids"]) & player_ids
            if authors and eligible_voters and eligible_voters == valid_voters:
                perfect_bluff_authors.update(authors)

    for player_id, stats in player_stats.items():
        player_new = []
        player_old = already_unlocked.get(player_id, set())

        if stats.get("correct_votes", 0) > 0 and "FIRST_CORRECT" not in player_old:
            player_new.append("FIRST_CORRECT")

        if stats["bluff_votes_received"] > 0 and "FIRST_BLUFF" not in player_old:
            player_new.append("FIRST_BLUFF")

        if stats["round_points"] >= 7 and "ROUND_STAR" not in player_old:
            player_new.append("ROUND_STAR")

        if (
            len(player_ids) >= 4
            and stats["correct_votes"] > 0
            and stats["bluff_votes_received"] >= 3
            and "PERFECT_ROUND" not in player_old
        ):
            player_new.append("PERFECT_ROUND")

        if player_id in perfect_bluff_authors and "PERFECT_BLUFF" not in player_old:
            player_new.append("PERFECT_BLUFF")

        if player_new:
            newly_unlocked[player_id] = player_new

    return newly_unlocked


def new_achievement_state(
    already_unlocked: dict[str, set[str]] | None = None,
) -> dict[str, dict]:
    """Start a game with fresh progress and optional existing unlocks."""
    return {
        "correct_answers": {},
        "unlocked": {
            player_id: codes.copy()
            for player_id, codes in (already_unlocked or {}).items()
        },
    }


def reset_game_progress(achievement_state: dict[str, dict]) -> dict[str, dict]:
    """Clear current-game progress while keeping room-memory unlocks."""
    return new_achievement_state(achievement_state["unlocked"])


def _copy_achievement_state(achievement_state: dict[str, dict]) -> dict[str, dict]:
    updated = reset_game_progress(achievement_state)
    updated["correct_answers"] = achievement_state["correct_answers"].copy()
    return updated


def evaluate_sharp_eye(
    player_stats: dict[str, dict],
    achievement_state: dict[str, dict],
) -> tuple[dict[str, dict], dict[str, list[str]]]:
    """Count at most one correct answer per player this round."""
    updated = _copy_achievement_state(achievement_state)
    newly_unlocked = {}

    for player_id, stats in player_stats.items():
        if stats.get("correct_votes", 0) <= 0:
            continue

        counts = updated["correct_answers"]
        counts[player_id] = counts.get(player_id, 0) + 1
        unlocked = updated["unlocked"].setdefault(player_id, set())
        if counts[player_id] >= 5 and "SHARP_EYE" not in unlocked:
            unlocked.add("SHARP_EYE")
            newly_unlocked[player_id] = ["SHARP_EYE"]

    return updated, newly_unlocked


def process_round_achievements(
    player_stats: dict[str, dict],
    choices_by_id: dict[str, dict],
    player_ids: set[str],
    achievement_state: dict[str, dict],
) -> tuple[dict[str, dict], dict[str, list[str]]]:
    """Evaluate round rules and carry their unlocks into game progress."""
    updated = _copy_achievement_state(achievement_state)
    newly_unlocked = evaluate_round_achievements(
        player_stats, choices_by_id, player_ids, updated["unlocked"]
    )
    for player_id, codes in newly_unlocked.items():
        updated["unlocked"].setdefault(player_id, set()).update(codes)

    updated, progress_unlocks = evaluate_sharp_eye(player_stats, updated)
    for player_id, codes in progress_unlocks.items():
        newly_unlocked.setdefault(player_id, []).extend(codes)

    return updated, newly_unlocked


def evaluate_game_achievements(
    final_scores: dict[str, int],
    achievement_state: dict[str, dict],
    *,
    game_finished: bool,
) -> tuple[dict[str, dict], dict[str, list[str]]]:
    """Check final scores only when the full game has finished."""
    updated = _copy_achievement_state(achievement_state)
    newly_unlocked = {}

    if game_finished:
        for player_id, score in final_scores.items():
            if score >= 20:
                unlocked = updated["unlocked"].setdefault(player_id, set())
                if "HIGH_SCORER" not in unlocked:
                    unlocked.add("HIGH_SCORER")
                    newly_unlocked[player_id] = ["HIGH_SCORER"]

    return updated, newly_unlocked
