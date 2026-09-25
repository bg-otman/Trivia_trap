import json

import pytest

from dataProcessing.ingestion import (
    build_voting_choices,
    calculate_results,
    validate_vote,
)


PLAYERS = {"p1": object(), "p2": object(), "p3": object()}


def make_choices():
    return [
        {
            "id": "correct-id",
            "text": "Truth",
            "author_ids": [],
            "is_correct": True,
        },
        {
            "id": "bluff-id",
            "text": "Bluff",
            "author_ids": ["p1"],
            "is_correct": False,
        },
        {
            "id": "decoy-id",
            "text": "Decoy",
            "author_ids": [],
            "is_correct": False,
        },
    ]


def test_calculate_results_with_no_votes():
    result = calculate_results({}, make_choices(), PLAYERS)
    assert all(stats["round_points"] == 0 for stats in result["player_stats"].values())


def test_correct_vote_is_worth_two_points():
    result = calculate_results({"p2": "correct-id"}, make_choices(), PLAYERS)
    assert result["player_stats"]["p2"]["round_points"] == 2


def test_bluff_vote_is_worth_one_point_for_the_author():
    result = calculate_results({"p2": "bluff-id"}, make_choices(), PLAYERS)
    assert result["player_stats"]["p1"]["round_points"] == 1


def test_database_decoy_is_worth_zero_points():
    result = calculate_results({"p2": "decoy-id"}, make_choices(), PLAYERS)
    assert all(stats["round_points"] == 0 for stats in result["player_stats"].values())


def test_player_who_does_not_vote_gets_zero_points():
    result = calculate_results({"p2": "correct-id"}, make_choices(), PLAYERS)
    assert result["player_stats"]["p3"]["round_points"] == 0


def test_shared_bluff_rewards_every_author():
    choices = make_choices()
    choices[1]["author_ids"] = ["p1", "p2"]
    result = calculate_results({"p3": "bluff-id"}, choices, PLAYERS)
    assert result["player_stats"]["p1"]["round_points"] == 1
    assert result["player_stats"]["p2"]["round_points"] == 1


def test_two_bluff_votes_are_worth_two_points():
    result = calculate_results(
        {"p2": "bluff-id", "p3": "bluff-id"},
        make_choices(),
        PLAYERS,
    )
    assert result["player_stats"]["p1"]["round_points"] == 2


@pytest.mark.parametrize(
    ("votes", "choices", "players", "message"),
    [
        ({"outside": "correct-id"}, make_choices(), PLAYERS, "outside the room"),
        ({"p2": "missing"}, make_choices(), PLAYERS, "unknown choice"),
        ({}, [make_choices()[1], make_choices()[2]], PLAYERS, "exactly one correct"),
        ({}, make_choices() + [{**make_choices()[0], "id": "other-correct"}], PLAYERS, "exactly one correct"),
        ({}, [{**make_choices()[1], "author_ids": ["outside"]}, make_choices()[0]], PLAYERS, "author is outside"),
    ],
)
def test_calculate_results_rejects_invalid_round_data(votes, choices, players, message):
    with pytest.raises(ValueError, match=message):
        calculate_results(votes, choices, players)


def test_build_choice_ids_are_used_unchanged_in_results():
    choices = build_voting_choices(
        3,
        {"p1": "Alpha", "p2": "Beta"},
        "Truth",
        ["Decoy"],
    )
    correct_id = next(choice["id"] for choice in choices if choice["is_correct"])
    result = calculate_results({"p3": correct_id}, choices, PLAYERS)
    assert result["correct_choice_id"] == correct_id
    assert [choice["id"] for choice in result["choices"]] == [
        choice["id"] for choice in choices
    ]
    json.dumps(result)


@pytest.mark.parametrize(
    ("voter_id", "choice_id", "votes", "player_ids", "reason"),
    [
        ("p2", "correct-id", {}, {"p1", "p2"}, ""),
        ("p1", "bluff-id", {}, {"p1", "p2"}, "SELF_VOTE"),
        ("p2", "correct-id", {"p2": "decoy-id"}, {"p1", "p2"}, "ALREADY_VOTED"),
        ("p2", "missing", {}, {"p1", "p2"}, "INVALID_CHOICE"),
        ("p2", "old-round-id", {}, {"p1", "p2"}, "INVALID_CHOICE"),
        ("outside", "correct-id", {}, {"p1", "p2"}, "NOT_IN_ROOM"),
        ("p2", 1, {}, {"p1", "p2"}, "INVALID_PAYLOAD"),
    ],
)
def test_validate_vote(voter_id, choice_id, votes, player_ids, reason):
    result = validate_vote(voter_id, choice_id, make_choices(), votes, player_ids)
    assert result["reason"] == reason
    assert result["is_valid"] is (reason == "")
