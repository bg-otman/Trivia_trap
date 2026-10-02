from types import SimpleNamespace

from .ingestion import (
    calculate_results,
)
from .achievements import (
    AchievementCode,
    evaluate_round_achievements,
    update_correct_answer_progress,
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
        "u1": ["BLUFFER", "LONE_GENIUS", "PERFECT_TRAP"]
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
    streaks, announced, totals, einstein_announced, unlocked = update_correct_answer_progress(
        {"u1": 4, "u2": 3},
        set(),
        {
            "u1": {"correct_votes": 1},
            "u2": {"correct_votes": 0},
        },
        previous_totals={"u1": 4, "u2": 3},
        einstein_already_announced=set(),
    )

    assert streaks == {"u1": 5, "u2": 0}
    assert announced == {"u1"}
    assert totals == {"u1": 5, "u2": 3}
    assert einstein_announced == set()
    assert unlocked == {"u1": [AchievementCode.TRUTH_SEEKER]}

    streaks, announced, totals, einstein_announced, unlocked = update_correct_answer_progress(
        streaks,
        announced,
        {
            "u1": {"correct_votes": 1},
            "u2": {"correct_votes": 1},
        },
        previous_totals=totals,
        einstein_already_announced=einstein_announced,
    )

    assert streaks == {"u1": 6, "u2": 1}
    assert announced == {"u1"}
    assert totals == {"u1": 6, "u2": 4}
    assert unlocked == {}


def test_truth_seeker_breaks_on_wrong_or_missing_vote_and_unlocks_once():
    streaks = {}
    announced = set()
    totals = {}
    einstein_announced = set()

    for _ in range(4):
        streaks, announced, totals, einstein_announced, unlocked = update_correct_answer_progress(
            streaks, announced, {"u1": {"correct_votes": 1}, "u2": {"correct_votes": 0}},
            totals, einstein_announced,
        )
        assert unlocked == {}
    assert streaks == {"u1": 4, "u2": 0}

    for missing_or_wrong in ({"correct_votes": 0}, {}):
        streaks, announced, totals, einstein_announced, unlocked = update_correct_answer_progress(
            streaks, announced, {"u1": missing_or_wrong, "u2": {"correct_votes": 1}},
            totals, einstein_announced,
        )
        assert streaks["u1"] == 0
        assert totals["u1"] == 4
        assert unlocked == {}

    for round_number in range(1, 6):
        streaks, announced, totals, einstein_announced, unlocked = update_correct_answer_progress(
            streaks, announced, {"u1": {"correct_votes": 1}, "u2": {"correct_votes": 0}},
            totals, einstein_announced,
        )
        assert unlocked == ({"u1": [AchievementCode.TRUTH_SEEKER]} if round_number == 5 else {})

    streaks, announced, totals, einstein_announced, _ = update_correct_answer_progress(
        streaks, announced, {"u1": {"correct_votes": 0}}, totals, einstein_announced,
    )
    for round_number in range(10):
        streaks, announced, totals, einstein_announced, unlocked = update_correct_answer_progress(
            streaks, announced, {"u1": {"correct_votes": 1}}, totals, einstein_announced,
        )
        assert unlocked == ({"u1": [AchievementCode.EINSTEIN]} if round_number == 0 else {})
    assert announced == {"u1"}
    assert einstein_announced == {"u1"}
    assert totals["u1"] == 19


def test_progress_unlocks_for_multiple_players_without_mutating_previous_state():
    streaks = {"u1": 4, "u2": 0, "u3": 2}
    totals = {"u1": 9, "u2": 9, "u3": 7}
    truth_announced = set()
    einstein_announced = set()
    next_streaks, next_truth, next_totals, next_einstein, unlocked = update_correct_answer_progress(
        streaks, truth_announced,
        {"u1": {"correct_votes": 1}, "u2": {"correct_votes": 1}, "u3": {}},
        totals, einstein_announced,
    )
    assert unlocked == {
        "u1": [AchievementCode.TRUTH_SEEKER, AchievementCode.EINSTEIN],
        "u2": [AchievementCode.EINSTEIN],
    }
    assert next_streaks == {"u1": 5, "u2": 1, "u3": 0}
    assert next_totals == {"u1": 10, "u2": 10, "u3": 7}
    assert next_truth == {"u1"}
    assert next_einstein == {"u1", "u2"}
    assert streaks == {"u1": 4, "u2": 0, "u3": 2}
    assert totals == {"u1": 9, "u2": 9, "u3": 7}
    assert truth_announced == einstein_announced == set()
