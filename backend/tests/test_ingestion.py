import json
from copy import deepcopy
from types import SimpleNamespace

import pytest

from dataProcessing.achievements import capture_remontada_midpoint
from dataProcessing.ingestion import (
    build_voting_choices, calculate_results, calculate_match_achievements, validate_vote,
)


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


@pytest.mark.parametrize("previous_total", [None, 9], ids=["truth-seeker", "both-progress-awards"])
def test_progress_joins_existing_achievements_without_changing_points(previous_total):
    players = {
        pid: SimpleNamespace(name=pid, score=0, avatar_url=None)
        for pid in ("p1", "p2", "p3", "p4", "p5")
    }
    streaks = {"p1": 4}
    announced = set()
    totals = {"p1": previous_total} if previous_total is not None else None
    einstein_announced = set() if totals is not None else None
    result = calculate_results(
        votes={"p1": "correct-id", **{pid: "bluff-id" for pid in ("p2", "p3", "p4", "p5")}},
        players=players,
        voting_choices=make_choices(),
        correct_answer_streaks=streaks,
        truth_seeker_announced=announced,
        correct_answer_totals=totals,
        einstein_announced=einstein_announced,
    )
    assert result["unlocked_achievements"] == {
        "p1": ["BLUFFER", "LONE_GENIUS", "PERFECT_TRAP", "TRUTH_SEEKER"]
        + (["EINSTEIN"] if previous_total is not None else [])
    }
    assert players["p1"].score == 9
    assert all(players[pid].score == 0 for pid in ("p2", "p3", "p4", "p5"))
    assert streaks == {"p1": 5, "p2": 0, "p3": 0, "p4": 0, "p5": 0}
    assert announced == {"p1"}
    if previous_total is not None:
        assert totals == {"p1": 10, "p2": 0, "p3": 0, "p4": 0, "p5": 0}
        assert einstein_announced == {"p1"}


def test_einstein_can_track_totals_independently_of_streaks(players):
    totals = {"p1": 9, "p2": 4, "p3": 2}
    announced = set()
    result = calculate_results(
        votes={"p1": "correct-id", "p2": "decoy-id"},
        players=players,
        voting_choices=make_choices(),
        correct_answer_totals=totals,
        einstein_announced=announced,
    )
    assert result["unlocked_achievements"] == {"p1": ["LONE_GENIUS", "EINSTEIN"]}
    assert totals == {"p1": 10, "p2": 4, "p3": 2}
    assert announced == {"p1"}
    assert [player.score for player in players.values()] == [1, 0, 0]


@pytest.mark.parametrize(
    ("round_votes", "expected"),
    [
        ([{"p1": "correct-id"}, {"p1": "correct-id"}], {"p1": ["ON_FIRE"]}),
        ([{"p1": "correct-id"}, {}, {"p1": "correct-id"}], {}),
        ([{"p1": "decoy-id"}, {"p1": "correct-id"}], {}),
        ([{"p2": "bluff-id"}, {"p1": "correct-id"}], {"p1": ["ON_FIRE"]}),
        ([{"p1": "correct-id", "p2": "correct-id"}], {"p1": ["ON_FIRE"], "p2": ["ON_FIRE"]}),
    ],
    ids=["every-round", "missing-vote-zero", "wrong-zero", "missing-vote-bluff-points", "multiple-players"],
)
def test_on_fire_uses_round_points_and_announces_once(players, round_votes, expected):
    for player in players.values():
        player.on_fire_eligible = True
        player.score = 100  # Existing totals cannot compensate for a zero-point round.
    for votes in round_votes:
        result = calculate_results(votes=votes, players=players, voting_choices=make_choices())
        assert all("ON_FIRE" not in codes for codes in result["unlocked_achievements"].values())
    scores = [player.score for player in players.values()]
    assert calculate_match_achievements(players) == expected
    assert calculate_match_achievements(players) == {}
    assert [player.score for player in players.values()] == scores


@pytest.mark.parametrize(
    ("midpoint_scores", "final_scores", "last_ids", "winner"),
    [
        ((0, 2, 3), (5, 3, 4), {"p1"}, "p1"),
        ((0, 2, 3), (1, 4, 3), {"p1"}, None),
        ((1, 2, 3), (2, 3, 6), {"p1"}, None),
        ((1, 1, 3), (5, 2, 4), {"p1", "p2"}, "p1"),
        ((1, 1, 3), (2, 5, 4), {"p1", "p2"}, "p2"),
        ((2, 2, 2), (5, 3, 4), set(), None),
        ((0, 2, 3), (5, 5, 4), {"p1"}, None),
    ],
    ids=["comeback", "last-but-loses", "winner-not-last", "tied-last-first-wins",
         "tied-last-second-wins", "all-tied", "no-unique-winner"],
)
def test_remontada_uses_ids_and_requires_last_then_winner(
    players, midpoint_scores, final_scores, last_ids, winner
):
    for player, score in zip(players.values(), midpoint_scores):
        player.name = "Same name"
        player.score = score
        player.remontada_eligible = True
    snapshot = capture_remontada_midpoint(players)
    assert snapshot == last_ids
    for player, score in zip(players.values(), final_scores):
        player.score = score
    expected = {winner: ["REMONTADA_MASTER"]} if winner else {}
    assert calculate_match_achievements(players, snapshot, max(final_scores)) == expected
    assert calculate_match_achievements(players, snapshot, max(final_scores)) == {}
    assert tuple(p.score for p in players.values()) == final_scores
    assert snapshot == last_ids


def test_remontada_does_not_replace_a_departed_podium_winner(players):
    players["p1"].score = 5
    players["p2"].score = 4
    players["p2"].remontada_eligible = True
    winning_score = players.pop("p1").score
    assert calculate_match_achievements(players, {"p2"}, winning_score) == {}


def test_shared_perfect_trap_requires_every_non_author_vote(players):
    choices = make_choices()
    choices[1]["author_ids"] = ["p1", "p2"]
    result = calculate_results(
        votes={"p3": "bluff-id"}, players=players, voting_choices=choices
    )
    assert result["unlocked_achievements"] == {
        "p1": ["PERFECT_TRAP"], "p2": ["PERFECT_TRAP"]
    }
    assert [player.score for player in players.values()] == [2, 2, 0]

    players = {
        pid: SimpleNamespace(name=pid, score=0, avatar_url=None)
        for pid in ("p1", "p2", "p3")
    }
    result = calculate_results(votes={}, players=players, voting_choices=choices)
    assert result["unlocked_achievements"] == {}


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
    assert set(result) == {"choices", "leaderboard", "unlocked_achievements"}


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


@pytest.mark.parametrize("votes_count", [3, 4])
def test_shared_bluffer_threshold_with_legal_voters(votes_count):
    players = {f"p{i}": SimpleNamespace(name=f"p{i}", score=0, avatar_url=None)
               for i in range(1, votes_count + 3)}
    choices = make_choices()
    choices[1]["author_ids"] = ["p1", "p2"]
    votes = {pid: "bluff-id" for pid in players if pid not in {"p1", "p2"}}
    result = calculate_results(votes, players, choices)
    for pid in ("p1", "p2"):
        assert ("BLUFFER" in result["unlocked_achievements"][pid]) == (votes_count >= 4)
        assert players[pid].score == votes_count * 2
        assert players[pid].bluff_votes_received == votes_count


@pytest.mark.parametrize("scenario", ["other-choice", "one-missing", "all-authors", "correct", "no-authors"])
def test_perfect_trap_excludes_ineligible_scenarios(players, scenario):
    choices = make_choices()
    votes = {"p2": "bluff-id", "p3": "bluff-id"}
    if scenario == "other-choice":
        votes["p3"] = "correct-id"
    elif scenario == "one-missing":
        votes.pop("p3")
    elif scenario == "all-authors":
        choices[1]["author_ids"] = list(players)
        votes = {}
    elif scenario == "correct":
        choices[0]["author_ids"] = ["p1"]
        votes = {"p2": "correct-id", "p3": "correct-id"}
    else:
        choices[1]["author_ids"] = []
    result = calculate_results(votes, players, choices)
    assert all("PERFECT_TRAP" not in codes for codes in result["unlocked_achievements"].values())
