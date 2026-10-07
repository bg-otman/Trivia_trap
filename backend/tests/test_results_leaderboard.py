from dataclasses import dataclass

from dataProcessing.ingestion import calculate_results


@dataclass
class Player:
    name: str
    score: int = 0
    avatar_url: str | None = None


def choices():
    return [
        {"id": "truth", "text": "Truth", "author_ids": [], "is_correct": True},
        {"id": "bluff", "text": "Bluff", "author_ids": ["p3"], "is_correct": False},
    ]


def test_results_leaderboard_contains_authoritative_round_fields():
    players = {
        "p1": Player("ALICE", score=3, avatar_url="alice.png"),
        "p2": Player("BOB", score=2),
        "p3": Player("CAROL", score=0),
    }

    result = calculate_results(
        {"p1": "bluff", "p2": "truth"},
        players,
        choices(),
    )

    assert result["leaderboard"] == [
        {
            "player_id": "p1",
            "username": "ALICE",
            "score": 3,
            "round_points": 0,
            "rank": 1,
            "rank_change": 0,
            "avatar_url": "alice.png",
        },
        {
            "player_id": "p2",
            "username": "BOB",
            "score": 3,
            "round_points": 1,
            "rank": 2,
            "rank_change": 0,
            "avatar_url": None,
        },
        {
            "player_id": "p3",
            "username": "CAROL",
            "score": 2,
            "round_points": 2,
            "rank": 3,
            "rank_change": 0,
            "avatar_url": None,
        },
    ]


def test_first_round_ties_preserve_room_insertion_order():
    players = {
        "host": Player("HOST"),
        "p2": Player("P2"),
        "p3": Player("P3"),
    }

    result = calculate_results({}, players, choices())

    assert [entry["player_id"] for entry in result["leaderboard"]] == [
        "host",
        "p2",
        "p3",
    ]
    assert [entry["rank"] for entry in result["leaderboard"]] == [1, 2, 3]
    assert [entry["rank_change"] for entry in result["leaderboard"]] == [0, 0, 0]


def test_rank_change_is_previous_rank_minus_current_rank():
    players = {
        "p1": Player("P1", score=3),
        "p2": Player("P2", score=2),
        "p3": Player("P3", score=0),
    }

    result = calculate_results(
        {"p1": "bluff", "p2": "bluff"},
        players,
        choices(),
    )

    by_id = {entry["player_id"]: entry for entry in result["leaderboard"]}
    assert by_id["p3"]["rank"] == 1
    assert by_id["p3"]["rank_change"] == 2
    assert by_id["p2"]["rank"] == 3
    assert by_id["p2"]["rank_change"] == -1
