from types import SimpleNamespace

from .ingestion import (
    calculate_results,
)
from .achievements import (
    AchievementCode,
    evaluate_round_achievements,
    update_correct_streaks,
)

def test_bluffer_requires_four_votes():
    player_stats = {
        "u1": {"bluff_votes_received": 4},
        "u2": {"bluff_votes_received": 3},
        "u3": {"bluff_votes_received": 6},
    }

    result = evaluate_round_achievements(
        player_stats
    )

    assert result == {
        "u1": [AchievementCode.BLUFFER],
        "u3": [AchievementCode.BLUFFER],
    }



def test_results_include_bluffer_achievement():
    players = {
        player_id: SimpleNamespace(
            name=player_id,
            score=0,
            avatar_url=None,
        )
        for player_id in ["u1", "u2", "u3", "u4", "u5"]
    }

    voting_choices = [
        {
            "id": "correct",
            "text": "Mars",
            "author_ids": [],
            "is_correct": True,
        },
        {
            "id": "bluff",
            "text": "Venus",
            "author_ids": ["u1"],
            "is_correct": False,
        },
    ]

    votes = {
        "u1": "correct",
        "u2": "bluff",
        "u3": "bluff",
        "u4": "bluff",
        "u5": "bluff",
    }

    result = calculate_results(
        votes=votes,
        players=players,
        voting_choices=voting_choices,
    )

    assert result["unlocked_achievements"] == {
        "u1": ["BLUFFER", "LONE_GENIUS"]
    }

def test_lone_genius_needs_one_correct_player():
    one_correct = {
        "u1": {"correct_votes": 1, "bluff_votes_received": 0},
        "u2": {"correct_votes": 0, "bluff_votes_received": 0},
    }
    assert evaluate_round_achievements(one_correct) == {
        "u1": [AchievementCode.LONE_GENIUS]
    }

    two_correct = {
        "u1": {"correct_votes": 1, "bluff_votes_received": 0},
        "u2": {"correct_votes": 1, "bluff_votes_received": 0},
    }
    assert evaluate_round_achievements(two_correct) == {}

    no_correct = {
        "u1": {"correct_votes": 0, "bluff_votes_received": 0},
        "u2": {"correct_votes": 0, "bluff_votes_received": 0},
    }
    assert evaluate_round_achievements(no_correct) == {}


def test_truth_seeker_streak():
    streaks, totals, unlocked = update_correct_answer_progress(
        {"u1": 4, "u2": 3},
        {"u1": 9, "u2": 2},
        {
            "u1": {"correct_votes": 1},
            "u2": {"correct_votes": 0},
        },
    )

    assert streaks == {"u1": 5, "u2": 0}
    assert totals == {"u1": 10, "u2": 2}
    assert unlocked == {"u1": [AchievementCode.TRUTH_SEEKER]}


    streaks, unlocked = update_correct_streaks(
        streaks,
        {
            "u1": {"correct_votes": 1},
            "u2": {"correct_votes": 1},
        },
    )

    assert streaks == {"u1": 6, "u2": 1}
    assert unlocked == []