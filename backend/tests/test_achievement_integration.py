import asyncio

from fastapi import WebSocket

from dataProcessing.achievement import new_achievement_state
from dataProcessing.ingestion import calculate_results
from engine import events
from engine.room_models import PlayerInfo, Room, RoomMetaData, RoomPhase, RoomSettings
from engine.utils import Context, clear_data


class FakeManager:
    def __init__(self, room):
        self.rooms = {"room": room}
        self.broadcasts = []
        self.replays = []

    async def broadcast(self, payload, room_id, exclude):
        self.broadcasts.append(payload)

    async def send_to_player(self, payload, room_id, player_id):
        self.replays.append(payload)


def make_room(player_ids=("p1", "p2", "p3")):
    async def receive():
        return {"type": "websocket.receive"}

    async def send(_message):
        pass

    players = {
        player_id: PlayerInfo(
            ws=WebSocket({"type": "websocket"}, receive, send), name=player_id
        )
        for player_id in player_ids
    }
    return Room(
        meta_data=RoomMetaData(host_id=player_ids[0], settings=RoomSettings()),
        players=players,
    )


def context():
    return Context(room_id="room", user_id="p1", user_name="p1")


def set_choices_and_votes(room, votes):
    room.meta_data.voting_choices = [
        {"id": "correct", "text": "answer", "author_ids": [], "is_correct": True},
        {"id": "bluff", "text": "fake", "author_ids": ["p1"], "is_correct": False},
    ]
    room.meta_data.voting_results = votes


def move_to_podium(room):
    room.meta_data.phase.start()
    for _ in range(4):
        room.meta_data.phase.cycle()
    assert room.meta_data.phase.current_state == RoomPhase.PODIUM


def test_result_details_preserve_default_payload_and_score_once():
    default_room = make_room(("p1", "p2"))
    detailed_room = make_room(("p1", "p2"))
    for room in (default_room, detailed_room):
        set_choices_and_votes(room, {"p1": "correct", "p2": "bluff"})

    public = calculate_results(
        default_room.meta_data.voting_results,
        default_room.players,
        default_room.meta_data.voting_choices,
    )
    detailed, stats, choices = calculate_results(
        detailed_room.meta_data.voting_results,
        detailed_room.players,
        detailed_room.meta_data.voting_choices,
        include_details=True,
    )

    assert set(public) == {"choices", "leaderboard"}
    assert detailed == public
    assert stats["p1"]["correct_votes"] == 1
    assert choices["correct"]["voter_ids"] == ["p1"]
    assert default_room.players["p1"].score == detailed_room.players["p1"].score == 3


def test_reveal_unlocks_round_rules_without_double_scoring_and_replays_payload():
    room = make_room()
    set_choices_and_votes(room, {"p1": "correct", "p2": "bluff", "p3": "bluff"})
    manager = FakeManager(room)

    asyncio.run(events.reveal_results(manager, context()))

    payload = manager.broadcasts[-1]
    assert payload["event"] == "RESULTS_REVEALED"
    assert {"choices", "leaderboard", "round", "total_rounds", "achievements"} <= set(payload["data"])
    assert payload["data"]["achievements"] == {
        "p1": ["FIRST_CORRECT", "FIRST_BLUFF", "PERFECT_BLUFF"]
    }
    assert room.players["p1"].score == 5
    assert room.meta_data.achievement_state["correct_answers"] == {"p1": 1}
    assert room.meta_data.achievement_state["unlocked"]["p1"] == {
        "FIRST_CORRECT", "FIRST_BLUFF", "PERFECT_BLUFF"
    }
    assert next(choice for choice in payload["data"]["choices"] if choice["id"] == "bluff")["voters"] == ["p2", "p3"]

    asyncio.run(events.sync_current_phase(manager, "room", "p1"))
    assert manager.replays[-1]["data"]["achievements"] == payload["data"]["achievements"]

    clear_data(room)
    set_choices_and_votes(room, {"p1": "correct", "p2": "bluff", "p3": "bluff"})
    asyncio.run(events.reveal_results(manager, context()))
    assert manager.broadcasts[-1]["data"]["achievements"] == {}
    assert room.players["p1"].score == 10
    assert room.meta_data.achievement_state["correct_answers"]["p1"] == 2


def test_reveal_with_no_votes_has_empty_achievements_and_unchanged_scores():
    room = make_room()
    set_choices_and_votes(room, {})
    manager = FakeManager(room)

    asyncio.run(events.reveal_results(manager, context()))

    assert manager.broadcasts[-1]["data"]["achievements"] == {}
    assert all(player.score == 0 for player in room.players.values())


def test_sharp_eye_progress_survives_round_clear_and_unlocks_once():
    room = make_room(("p1", "p2"))
    manager = FakeManager(room)
    for round_number in range(1, 7):
        set_choices_and_votes(room, {"p1": "correct"})
        asyncio.run(events.reveal_results(manager, context()))
        achievements = manager.broadcasts[-1]["data"]["achievements"]
        assert ("SHARP_EYE" in achievements.get("p1", [])) is (round_number == 5)
        assert room.meta_data.achievement_state["correct_answers"]["p1"] == round_number
        if round_number < 6:
            clear_data(room)
    assert room.players["p1"].score == 6


def test_room_achievement_states_are_independent():
    first = make_room()
    second = make_room()
    first.meta_data.achievement_state["correct_answers"]["p1"] = 4
    first.meta_data.achievement_state["unlocked"]["p1"] = {"FIRST_CORRECT"}
    assert second.meta_data.achievement_state == new_achievement_state()


def test_return_to_lobby_resets_progress_and_keeps_unlocks():
    room = make_room()
    room.meta_data.achievement_state["correct_answers"]["p1"] = 4
    room.meta_data.achievement_state["unlocked"]["p1"] = {"FIRST_CORRECT"}
    room.players["p1"].score = 7
    manager = FakeManager(room)

    asyncio.run(events.return_to_lobby(manager, context()))

    assert room.meta_data.achievement_state == new_achievement_state(
        {"p1": {"FIRST_CORRECT"}}
    )
    assert room.players["p1"].score == 0


def test_starting_new_game_resets_progress_without_database(monkeypatch):
    room = make_room()
    room.meta_data.achievement_state["correct_answers"]["p1"] = 4
    room.meta_data.achievement_state["unlocked"]["p1"] = {"FIRST_CORRECT"}
    room.meta_data.current_round = 11
    room.players["p1"].score = 20
    manager = FakeManager(room)

    async def categories(_language):
        return [{"id": 1, "name": "General"}]

    monkeypatch.setattr(events, "load_categories", categories)
    asyncio.run(events.to_next_phase(manager, context()))

    assert room.meta_data.achievement_state == new_achievement_state(
        {"p1": {"FIRST_CORRECT"}}
    )
    assert room.meta_data.current_round == 1
    assert room.players["p1"].score == 0


def test_high_scorer_only_when_podium_ends_game_after_tie():
    room = make_room(("p1", "p2"))
    move_to_podium(room)
    room.meta_data.current_round = room.meta_data.settings.total_rounds + 1
    room.players["p1"].score = room.players["p2"].score = 20
    room.meta_data.podium = [
        {"player_id": player_id, "score": player.score, "rank": rank}
        for rank, (player_id, player) in enumerate(room.players.items(), start=1)
    ]
    manager = FakeManager(room)

    asyncio.run(events.podium(manager, context()))
    assert manager.broadcasts[-1]["data"]["achievements"] == {}
    assert manager.broadcasts[-1]["data"]["game_finished"] is False
    assert room.meta_data.achievement_state["unlocked"] == {}
    assert room.meta_data.phase.current_state == RoomPhase.PODIUM

    room.players["p1"].score = 21
    room.meta_data.podium[0]["score"] = 21
    room.meta_data.current_round += 1
    asyncio.run(events.podium(manager, context()))
    assert manager.broadcasts[-1]["data"]["achievements"] == {
        "p1": ["HIGH_SCORER"],
        "p2": ["HIGH_SCORER"],
    }
    assert manager.broadcasts[-1]["data"]["game_finished"] is True
    assert room.meta_data.phase.current_state == RoomPhase.LOBBY
    asyncio.run(events.sync_current_phase(manager, "room", "p1"))
    assert manager.replays[-1]["data"]["achievements"] == manager.broadcasts[-1]["data"]["achievements"]


def test_high_scorer_waits_for_configured_rounds():
    room = make_room(("p1", "p2"))
    move_to_podium(room)
    room.meta_data.current_round = room.meta_data.settings.total_rounds
    room.players["p1"].score = 21
    room.players["p2"].score = 1
    room.meta_data.podium = [
        {"player_id": player_id, "score": player.score, "rank": rank}
        for rank, (player_id, player) in enumerate(room.players.items(), start=1)
    ]
    manager = FakeManager(room)

    asyncio.run(events.podium(manager, context()))

    assert manager.broadcasts[-1]["data"]["achievements"] == {}
    assert manager.broadcasts[-1]["data"]["game_finished"] is False
    assert room.meta_data.achievement_state["unlocked"] == {}
