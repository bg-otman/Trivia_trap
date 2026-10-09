from copy import deepcopy

import pytest

from app.dataProcessing.achievement import (
    evaluate_game_achievements,
    evaluate_round_achievements,
    evaluate_sharp_eye,
    new_achievement_state,
    process_round_achievements,
)


def stats(correct=0, bluff=0, points=None):
    return {
        "correct_votes": correct,
        "bluff_votes_received": bluff,
        "round_points": correct + 2 * bluff if points is None else points,
    }


def evaluate(player_stats, player_ids=None, choices=None, unlocked=None):
    return evaluate_round_achievements(
        player_stats,
        {} if choices is None else choices,
        set(player_stats) if player_ids is None else player_ids,
        {} if unlocked is None else unlocked,
    )


def test_first_correct():
    assert evaluate({"p1": stats(correct=1)}) == {"p1": ["FIRST_CORRECT"]}


def test_first_bluff():
    assert evaluate({"p1": stats(bluff=1)}) == {"p1": ["FIRST_BLUFF"]}


def test_first_correct_and_first_bluff_in_same_round():
    assert evaluate({"p1": stats(correct=1, bluff=1)}) == {
        "p1": ["FIRST_CORRECT", "FIRST_BLUFF"]
    }


def test_already_unlocked_achievements_are_not_returned():
    assert evaluate(
        {"p1": stats(correct=1, bluff=1)},
        unlocked={"p1": {"FIRST_CORRECT", "FIRST_BLUFF"}},
    ) == {}


@pytest.mark.parametrize(
    ("points", "expected"),
    [(7, {"p1": ["ROUND_STAR"]}), (6, {})],
)
def test_round_star_threshold(points, expected):
    assert evaluate({"p1": stats(points=points)}) == expected


@pytest.mark.parametrize(
    ("correct", "bluff", "player_count", "expected"),
    [(1, 3, 4, True), (1, 3, 3, False), (0, 3, 4, False)],
)
def test_perfect_round_conditions(correct, bluff, player_count, expected):
    player_ids = {f"p{i}" for i in range(1, player_count + 1)}
    result = evaluate(
        {"p1": stats(correct=correct, bluff=bluff)}, player_ids=player_ids
    )
    assert ("PERFECT_ROUND" in result.get("p1", [])) is expected


@pytest.mark.parametrize(
    ("player_ids", "voter_ids", "is_correct", "expected"),
    [
        ({"p1", "p2", "p3", "p4"}, ["p2", "p3", "p4"], False, True),
        ({"p1", "p2", "p3", "p4"}, ["p2", "p3"], False, False),
        ({"p1", "p2", "p3", "p4"}, ["p2", "p3", "outsider"], False, False),
        ({"p1", "p2"}, ["p2"], False, False),
        ({"p1", "p2", "p3", "p4"}, ["p2", "p3", "p4"], True, False),
    ],
)
def test_perfect_bluff_conditions(player_ids, voter_ids, is_correct, expected):
    choices = {
        "choice": {
            "author_ids": ["p1"],
            "voter_ids": voter_ids,
            "is_correct": is_correct,
        }
    }
    result = evaluate({"p1": stats()}, player_ids=player_ids, choices=choices)
    assert ("PERFECT_BLUFF" in result.get("p1", [])) is expected


def test_shared_bluff_unlocks_for_both_authors():
    players = {"p1", "p2", "p3", "p4"}
    choices = {
        "shared": {
            "author_ids": ["p1", "p2"],
            "voter_ids": ["p3", "p4"],
            "is_correct": False,
        }
    }
    result = evaluate(
        {"p1": stats(bluff=2), "p2": stats(bluff=2)},
        player_ids=players,
        choices=choices,
    )
    assert "PERFECT_BLUFF" in result["p1"]
    assert "PERFECT_BLUFF" in result["p2"]


def test_perfect_bluff_does_not_unlock_twice():
    choices = {
        "choice": {
            "author_ids": ["p1"],
            "voter_ids": ["p2", "p3"],
            "is_correct": False,
        }
    }
    assert evaluate(
        {"p1": stats()},
        player_ids={"p1", "p2", "p3"},
        choices=choices,
        unlocked={"p1": {"PERFECT_BLUFF"}},
    ) == {}


def test_no_achievement_returns_empty_result():
    assert evaluate({"p1": stats(), "p2": stats()}) == {}


def test_inputs_are_not_mutated():
    player_stats = {"p1": stats(correct=1), "p2": stats()}
    choices = {
        "choice": {
            "author_ids": ["p1"],
            "voter_ids": ["p2"],
            "is_correct": False,
        }
    }
    player_ids = {"p1", "p2"}
    unlocked = {"p1": {"FIRST_BLUFF"}}
    before = deepcopy((player_stats, choices, player_ids, unlocked))

    evaluate(player_stats, player_ids, choices, unlocked)

    assert (player_stats, choices, player_ids, unlocked) == before


def test_sharp_eye_counter_starts_at_zero():
    assert new_achievement_state()["correct_answers"].get("p1", 0) == 0


@pytest.mark.parametrize(
    ("player_stats", "expected_count"),
    [
        ({"p1": {"correct_votes": 1}}, 1),
        ({"p1": {"correct_votes": 0}}, 0),
        ({"p1": {}}, 0),
        ({"p1": {"correct_votes": 2}}, 1),
    ],
)
def test_sharp_eye_counts_one_correct_round_at_most(player_stats, expected_count):
    updated, newly_unlocked = evaluate_sharp_eye(player_stats, new_achievement_state())
    assert updated["correct_answers"].get("p1", 0) == expected_count
    assert newly_unlocked == {}


def test_sharp_eye_unlocks_on_fifth_round_and_not_again():
    state = new_achievement_state()
    for round_number in range(1, 5):
        state, unlocked = evaluate_sharp_eye({"p1": {"correct_votes": 1}}, state)
        assert state["correct_answers"]["p1"] == round_number
        assert unlocked == {}

    state, unlocked = evaluate_sharp_eye({"p1": {"correct_votes": 1}}, state)
    assert state["correct_answers"]["p1"] == 5
    assert unlocked == {"p1": ["SHARP_EYE"]}
    assert state["unlocked"]["p1"] == {"SHARP_EYE"}

    state, unlocked = evaluate_sharp_eye({"p1": {"correct_votes": 1}}, state)
    assert state["correct_answers"]["p1"] == 6
    assert unlocked == {}


def test_sharp_eye_tracks_players_independently_across_rounds():
    state = new_achievement_state()
    for _ in range(4):
        state, _ = evaluate_sharp_eye(
            {"p1": {"correct_votes": 1}, "p2": {"correct_votes": 0}}, state
        )
    state, unlocked = evaluate_sharp_eye(
        {"p1": {"correct_votes": 1}, "p2": {"correct_votes": 1}}, state
    )
    assert state["correct_answers"] == {"p1": 5, "p2": 1}
    assert unlocked == {"p1": ["SHARP_EYE"]}


def test_new_game_resets_progress_but_preserves_existing_unlocks():
    previous = new_achievement_state()
    previous, _ = evaluate_sharp_eye({"p1": {"correct_votes": 1}}, previous)
    fresh = new_achievement_state(previous["unlocked"])
    assert fresh["correct_answers"].get("p1", 0) == 0

    unlocked_history = {"p1": {"SHARP_EYE"}}
    fresh = new_achievement_state(unlocked_history)
    assert fresh["unlocked"] == unlocked_history
    assert fresh["unlocked"]["p1"] is not unlocked_history["p1"]


def test_sharp_eye_does_not_unlock_when_already_earned():
    state = new_achievement_state({"p1": {"SHARP_EYE"}})
    state["correct_answers"]["p1"] = 4
    updated, unlocked = evaluate_sharp_eye({"p1": {"correct_votes": 1}}, state)
    assert updated["correct_answers"]["p1"] == 5
    assert unlocked == {}


@pytest.mark.parametrize(
    ("score", "expected"),
    [(19, {}), (20, {"p1": ["HIGH_SCORER"]}), (21, {"p1": ["HIGH_SCORER"]})],
)
def test_high_scorer_final_score_threshold(score, expected):
    _, unlocked = evaluate_game_achievements(
        {"p1": score}, new_achievement_state(), game_finished=True
    )
    assert unlocked == expected


def test_high_scorer_requires_game_to_finish():
    updated, unlocked = evaluate_game_achievements(
        {"p1": 20}, new_achievement_state(), game_finished=False
    )
    assert unlocked == {}
    assert updated["unlocked"] == {}


def test_high_scorer_is_independent_per_player_and_unlocks_once():
    state = new_achievement_state({"p1": {"HIGH_SCORER"}})
    updated, unlocked = evaluate_game_achievements(
        {"p1": 24, "p2": 20, "p3": 19}, state, game_finished=True
    )
    assert unlocked == {"p2": ["HIGH_SCORER"]}
    assert updated["unlocked"]["p1"] == {"HIGH_SCORER"}
    assert updated["unlocked"]["p2"] == {"HIGH_SCORER"}


def test_no_game_achievement_returns_empty_result():
    _, unlocked = evaluate_game_achievements(
        {"p1": 10, "p2": 19}, new_achievement_state(), game_finished=True
    )
    assert unlocked == {}


def test_game_achievement_evaluators_do_not_mutate_inputs():
    state = new_achievement_state({"p1": {"FIRST_CORRECT"}})
    stats = {"p1": {"correct_votes": 1}}
    scores = {"p1": 20}
    before = deepcopy((state, stats, scores))

    evaluate_sharp_eye(stats, state)
    evaluate_game_achievements(scores, state, game_finished=True)

    assert (state, stats, scores) == before


def test_round_processing_remembers_unlocks_for_later_rounds():
    state = new_achievement_state()
    player_stats = {"p1": stats(correct=1)}
    original = deepcopy(state)

    state, first = process_round_achievements(player_stats, {}, {"p1"}, state)
    assert first == {"p1": ["FIRST_CORRECT"]}
    assert state["unlocked"]["p1"] == {"FIRST_CORRECT"}
    assert original == new_achievement_state()

    state, second = process_round_achievements(player_stats, {}, {"p1"}, state)
    assert second == {}
    assert state["correct_answers"]["p1"] == 2


def test_round_processing_combines_round_and_game_progress_unlocks():
    state = new_achievement_state()
    state["correct_answers"]["p1"] = 4
    updated, unlocked = process_round_achievements(
        {"p1": stats(correct=1)}, {}, {"p1"}, state
    )
    assert unlocked == {"p1": ["FIRST_CORRECT", "SHARP_EYE"]}
    assert updated["unlocked"]["p1"] == {"FIRST_CORRECT", "SHARP_EYE"}
    assert state["correct_answers"]["p1"] == 4

