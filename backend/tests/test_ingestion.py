import json
from copy import deepcopy
from types import SimpleNamespace

import pytest

from dataProcessing.ingestion import build_voting_choices, calculate_results, validate_vote


@pytest.fixture
def players():
    return {
        pid: SimpleNamespace(name=name, score=0, avatar_url=f"/{pid}.png")
        for pid, name in (("p1", "Amine"), ("p2", "Sara"), ("p3", "Youssef"))
    }


def make_choices():
    return [
        {"id": "correct-id", "text": "Truth", "author_ids": [], "is_correct": True},
        {"id": "bluff-id", "text": "Bluff", "author_ids": ["p1"], "is_correct": False},
        {"id": "decoy-id", "text": "Decoy", "author_ids": [], "is_correct": False},
    ]


@pytest.mark.parametrize(
    ("votes", "expected_scores"),
    [
        pytest.param({}, (0, 0, 0), id="zero-votes"),
        pytest.param({"p2": "correct-id"}, (0, 1, 0), id="correct-vote-one-point"),
        pytest.param({"p2": "bluff-id"}, (2, 0, 0), id="bluff-vote-two-points"),
        pytest.param({"p2": "decoy-id"}, (0, 0, 0), id="decoy-zero-points"),
        pytest.param({"p2": "bluff-id", "p3": "bluff-id"}, (4, 0, 0), id="two-bluff-votes"),
        pytest.param(
            {"p1": "correct-id", "p2": "bluff-id"}, (3, 0, 0), id="partial-votes"
        ),
        pytest.param(
            {"p1": "correct-id", "p2": "bluff-id", "p3": "correct-id"},
            (3, 0, 1), id="complete-round",
        ),
    ],
)
def test_calculate_results_scores(players, votes, expected_scores):
    result = calculate_results(votes=votes, players=players, voting_choices=make_choices())
    assert tuple(player.score for player in players.values()) == expected_scores
    assert {row["username"]: row["score"] for row in result["leaderboard"]} == {
        player.name: score for player, score in zip(players.values(), expected_scores)
    }
    assert [row["score"] for row in result["leaderboard"]] == sorted(expected_scores, reverse=True)


def test_shared_bluff_rewards_every_author(players):
    choices = make_choices()
    choices[1]["author_ids"] = ["p1", "p2"]
    calculate_results(votes={"p3": "bluff-id"}, players=players, voting_choices=choices)
    assert [player.score for player in players.values()] == [2, 2, 0]


def test_results_add_round_points_to_existing_scores(players):
    players["p1"].score = 7
    result = calculate_results(
        votes={"p2": "bluff-id"}, players=players, voting_choices=make_choices()
    )
    assert players["p1"].score == 9
    assert result["leaderboard"][0] == {
        "username": "Amine", "score": 9, "avatar_url": "/p1.png"
    }


def test_build_choices_uses_author_ids_and_merges_similar_bluffs():
    choices = build_voting_choices(
        3, {"p1": "Alpha!", "p2": "  ALPHA ", "p3": "Truth!"},
        "Truth", ["alpha", "TRUTH", "Decoy"],
    )
    assert all("author_ids" in choice and "authors_names" not in choice for choice in choices)
    bluffs = [choice for choice in choices if choice["author_ids"]]
    assert len(bluffs) == 1
    assert set(bluffs[0]["author_ids"]) == {"p1", "p2"}
    assert bluffs[0]["is_correct"] is False
    correct = [choice for choice in choices if choice["is_correct"]]
    assert len(correct) == 1
    assert correct[0]["text"] == "Truth"
    assert correct[0]["author_ids"] == []
    assert len({choice["id"] for choice in choices}) == len(choices)


def test_results_accept_exactly_one_correct_answer(players):
    result = calculate_results(votes={}, players=players, voting_choices=make_choices())
    assert sum(choice["is_correct"] for choice in result["choices"]) == 1
    assert set(result) == {"choices", "leaderboard"}


@pytest.mark.parametrize(
    ("choices", "message"),
    [
        pytest.param([], "Voting choices are missing", id="empty-choices"),
        pytest.param(make_choices()[1:], "must contain one correct answer", id="zero-correct"),
        pytest.param(
            make_choices() + [{**make_choices()[0], "id": "other-correct"}],
            "must contain one correct answer", id="two-correct",
        ),
    ],
)
def test_results_reject_invalid_correct_answer_count(players, choices, message):
    with pytest.raises(ValueError, match=message):
        calculate_results(votes={}, players=players, voting_choices=choices)
    assert all(player.score == 0 for player in players.values())


@pytest.mark.parametrize(
    "votes",
    [pytest.param({"outside": "correct-id"}, id="outside-voter"),
     pytest.param({"p2": "missing"}, id="unknown-choice")],
)
def test_results_ignore_unknown_vote_references(players, votes):
    # Submission validates votes; aggregation skips stale references.
    result = calculate_results(votes=votes, players=players, voting_choices=make_choices())
    assert all(player.score == 0 for player in players.values())
    assert all(choice["voters"] == [] for choice in result["choices"])


def test_results_ignore_absent_authors(players):
    choices = make_choices()
    choices[1]["author_ids"] = ["p1", "outside"]
    result = calculate_results(votes={"p2": "bluff-id"}, players=players, voting_choices=choices)
    assert players["p1"].score == 2
    bluff = next(choice for choice in result["choices"] if choice["id"] == "bluff-id")
    assert bluff["authors_names"] == ["Amine"]


def test_build_choice_ids_are_used_unchanged_in_results(players):
    choices = build_voting_choices(3, {"p1": "Alpha", "p2": "Beta"}, "Truth", ["Decoy"])
    original = deepcopy(choices)
    correct_id = next(choice["id"] for choice in choices if choice["is_correct"])
    result = calculate_results(votes={"p3": correct_id}, players=players, voting_choices=choices)
    assert [choice["id"] for choice in result["choices"]] == [choice["id"] for choice in choices]
    assert next(choice["id"] for choice in result["choices"] if choice["is_correct"]) == correct_id
    assert choices == original
    json.dumps(result)


def test_results_authors_and_voters_are_separate_player_names(players):
    choices = make_choices()
    choices[1]["author_ids"] = ["p1", "p2"]
    result = calculate_results(
        votes={"p1": "correct-id", "p2": "correct-id", "p3": "bluff-id"},
        players=players, voting_choices=choices,
    )
    by_id = {choice["id"]: choice for choice in result["choices"]}
    assert by_id["bluff-id"]["authors_names"] == ["Amine", "Sara"]
    assert by_id["bluff-id"]["voters"] == ["Youssef"]
    assert by_id["correct-id"]["authors_names"] is None
    assert by_id["correct-id"]["voters"] == ["Amine", "Sara"]
    assert by_id["decoy-id"]["authors_names"] == []
    assert by_id["decoy-id"]["voters"] == []
    assert all("author_ids" not in choice and "voter_ids" not in choice for choice in result["choices"])


@pytest.mark.parametrize(
    ("voter_id", "choice_id", "votes", "reason"),
    [
        pytest.param("p2", "correct-id", {}, "", id="valid"),
        pytest.param("p1", "bluff-id", {}, "SELF_VOTE", id="self-vote"),
        pytest.param("p2", "correct-id", {"p2": "decoy-id"}, "ALREADY_VOTED", id="duplicate"),
        pytest.param("p2", "missing", {}, "INVALID_CHOICE", id="unknown-choice"),
        pytest.param("p2", "old-round-id", {}, "INVALID_CHOICE", id="old-choice"),
        pytest.param("outside", "correct-id", {}, "NOT_IN_ROOM", id="outside-player"),
        pytest.param("p2", 1, {}, "INVALID_CHOICE", id="integer-choice"),
        pytest.param("p2", ["correct-id"], {}, "INVALID_CHOICE", id="list-choice"),
        pytest.param("p2", {"id": "correct-id"}, {}, "INVALID_CHOICE", id="dict-choice"),
    ],
)
def test_validate_vote(voter_id, choice_id, votes, reason):
    original = votes.copy()
    result = validate_vote(voter_id, choice_id, make_choices(), votes, {"p1", "p2", "p3"})
    assert result == {"is_valid": reason == "", "reason": reason}
    assert votes == original


@pytest.mark.parametrize("voter_id", ["p1", "p2"])
def test_shared_bluff_rejects_each_authors_own_vote(voter_id):
    choices = make_choices()
    choices[1]["author_ids"] = ["p1", "p2"]
    assert validate_vote(voter_id, "bluff-id", choices, {}, {"p1", "p2", "p3"}) == {
        "is_valid": False, "reason": "SELF_VOTE"
    }
