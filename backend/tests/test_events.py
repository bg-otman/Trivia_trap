import asyncio

import pytest
from fastapi import WebSocket
import engine.events as events

from engine.events import (
    advance_phase,
    cancel_phase_timer,
    get_question,
    get_vote_choices,
    phase_timer,
    reevaluate_room_progress,
    schedule_phase_timer,
    submit_vote,
)
from engine.room_models import PlayerInfo, Room, RoomMetaData, RoomPhase, RoomSettings
from engine.utils import Context, GameError, clear_data


def fake_websocket():
    async def receive():
        return {"type": "websocket.receive", "text": "{}"}

    async def send(message):
        return None

    return WebSocket({"type": "websocket"}, receive, send)


def player(player_id):
    return PlayerInfo(ws=fake_websocket(), name=player_id)


def phase_at_vote():
    phase = RoomPhase()
    phase.start()
    phase.cycle()
    phase.cycle()
    return phase


def voting_choices():
    return [
        {"id": "correct", "text": "Truth", "author_ids": [], "is_correct": True},
        {"id": "bluff-p2", "text": "Bluff", "author_ids": ["p2"], "is_correct": False},
        {"id": "decoy", "text": "Decoy", "author_ids": [], "is_correct": False},
    ]


def vote_room():
    return Room(
        meta_data=RoomMetaData(
            host_id="host",
            settings=RoomSettings(total_rounds=1, bluff_time=10, vote_time=10),
            phase=phase_at_vote(),
            active_question="Question",
            correct_answer="Truth",
            sumbitted_bluffs={"host": "Host", "p2": "Bluff", "p3": "Third"},
            voting_choices=voting_choices(),
        ),
        players={player_id: player(player_id) for player_id in ("host", "p2", "p3")},
    )


class ProbeManager:
    def __init__(self, room):
        self.rooms = {"room": room}
        self.broadcasts = []
        self.direct = []

    async def broadcast(self, data, room_id, exclude=None):
        self.broadcasts.append(data)

    async def send_to_player(self, data, room_id, player_id):
        self.direct.append((player_id, data))


def context(player_id, choice_id):
    return Context(
        room_id="room",
        user_id=player_id,
        user_name=player_id,
        data={"choice_id": choice_id},
    )


async def submit_sequence(order):
    room = vote_room()
    manager = ProbeManager(room)
    selected = {"host": "bluff-p2", "p2": "correct", "p3": "decoy"}
    for player_id in order:
        await submit_vote(manager, context(player_id, selected[player_id]))
    return room, manager


@pytest.mark.parametrize(
    "order",
    [
        ("p2", "p3", "host"),
        ("host", "p2", "p3"),
        ("host", "p3", "p2"),
    ],
)
def test_any_player_can_be_the_last_voter(order):
    async def scenario():
        room, manager = await submit_sequence(order)
        assert room.meta_data.phase.current_state == RoomPhase.REVEAL
        assert [item["event"] for item in manager.broadcasts].count("RESULTS_REVEALED") == 1

    asyncio.run(scenario())


def test_concurrent_votes_reveal_once_and_apply_points_once():
    async def scenario():
        room = vote_room()
        manager = ProbeManager(room)
        await asyncio.gather(
            submit_vote(manager, context("host", "bluff-p2")),
            submit_vote(manager, context("p2", "correct")),
            submit_vote(manager, context("p3", "decoy")),
        )
        assert [item["event"] for item in manager.broadcasts].count("RESULTS_REVEALED") == 1
        assert room.players["p2"].score == 3

    asyncio.run(scenario())


def test_concurrent_duplicate_vote_is_rejected():
    async def scenario():
        room = vote_room()
        manager = ProbeManager(room)
        results = await asyncio.gather(
            submit_vote(manager, context("host", "correct")),
            submit_vote(manager, context("host", "decoy")),
            return_exceptions=True,
        )
        errors = [result for result in results if isinstance(result, GameError)]
        assert len(errors) == 1
        assert errors[0].error_code == "ALREADY_VOTED"
        assert len(room.meta_data.voting_results) == 1

    asyncio.run(scenario())


@pytest.mark.parametrize(
    ("player_id", "choice_id", "error_code"),
    [
        ("p2", "bluff-p2", "SELF_VOTE"),
        ("p2", "missing", "INVALID_CHOICE"),
        ("p2", "old-round-id", "INVALID_CHOICE"),
        ("p2", 1, "INVALID_PAYLOAD"),
    ],
)
def test_submit_vote_rejects_invalid_votes(player_id, choice_id, error_code):
    async def scenario():
        room = vote_room()
        manager = ProbeManager(room)
        with pytest.raises(GameError) as caught:
            await submit_vote(manager, context(player_id, choice_id))
        assert caught.value.error_code == error_code
        assert room.meta_data.voting_results == {}

    asyncio.run(scenario())


@pytest.mark.parametrize("votes", [{}, {"host": "correct"}])
def test_vote_timer_reveals_with_zero_or_partial_votes(votes):
    async def scenario():
        room = vote_room()
        room.meta_data.voting_results.update(votes)
        manager = ProbeManager(room)
        schedule_phase_timer(manager, "room", RoomPhase.VOTE, 0)
        await asyncio.wait_for(room.meta_data.timer_task, 1)
        assert room.meta_data.phase.current_state == RoomPhase.REVEAL
        assert [item["event"] for item in manager.broadcasts].count("RESULTS_REVEALED") == 1

    asyncio.run(scenario())


def test_disconnected_non_voter_no_longer_blocks_reveal():
    async def scenario():
        room = vote_room()
        manager = ProbeManager(room)
        await submit_vote(manager, context("host", "correct"))
        await submit_vote(manager, context("p2", "decoy"))
        room.players["p3"].is_present = False
        await reevaluate_room_progress(manager, "room")
        assert room.meta_data.phase.current_state == RoomPhase.REVEAL
        assert [item["event"] for item in manager.broadcasts].count("RESULTS_REVEALED") == 1

    asyncio.run(scenario())


def test_last_vote_cancels_timer_without_double_scoring():
    async def scenario():
        room = vote_room()
        manager = ProbeManager(room)
        await submit_vote(manager, context("host", "bluff-p2"))
        await submit_vote(manager, context("p2", "correct"))
        schedule_phase_timer(manager, "room", RoomPhase.VOTE, 0.01)
        timer = room.meta_data.timer_task
        await submit_vote(manager, context("p3", "decoy"))
        await asyncio.sleep(0.02)
        assert timer.done()
        assert room.players["p2"].score == 3
        assert [item["event"] for item in manager.broadcasts].count("RESULTS_REVEALED") == 1

    asyncio.run(scenario())


def test_last_vote_racing_timer_reveals_and_scores_at_most_once():
    async def scenario():
        room = vote_room()
        room.meta_data.voting_results.update({"host": "bluff-p2", "p2": "correct"})
        manager = ProbeManager(room)
        schedule_phase_timer(manager, "room", RoomPhase.VOTE, 0)
        timer = room.meta_data.timer_task
        vote_result = await asyncio.gather(
            timer,
            submit_vote(manager, context("p3", "decoy")),
            return_exceptions=True,
        )
        assert room.meta_data.phase.current_state == RoomPhase.REVEAL
        assert [item["event"] for item in manager.broadcasts].count("RESULTS_REVEALED") == 1
        assert room.players["p2"].score == 3
        assert sum(isinstance(item, GameError) for item in vote_result) <= 1

    asyncio.run(scenario())


def test_old_timer_does_not_move_a_new_phase():
    async def scenario():
        room = vote_room()
        manager = ProbeManager(room)
        schedule_phase_timer(manager, "room", RoomPhase.VOTE, 0.01)
        timer = room.meta_data.timer_task
        room.meta_data.phase.cycle()
        await asyncio.wait_for(timer, 1)
        assert room.meta_data.phase.current_state == RoomPhase.REVEAL
        assert manager.broadcasts == []

    asyncio.run(scenario())


def test_timer_handler_error_rolls_back_phase_and_broadcasts_error(monkeypatch):
    async def scenario():
        room = vote_room()
        manager = ProbeManager(room)

        async def fail(_manager, _context):
            raise RuntimeError("forced timer failure")

        monkeypatch.setitem(events.game_phases, RoomPhase.REVEAL, fail)
        schedule_phase_timer(manager, "room", RoomPhase.VOTE, 0)
        await asyncio.wait_for(room.meta_data.timer_task, 1)
        assert room.meta_data.phase.current_state == RoomPhase.VOTE
        assert manager.broadcasts[-1]["event"] == "ERROR"
        assert manager.broadcasts[-1]["data"]["code"] == "SERVER_ERROR"

    asyncio.run(scenario())


def test_voting_broadcast_hides_answer_metadata_and_reuses_choice_ids():
    async def scenario():
        room = vote_room()
        room.meta_data.voting_choices.clear()
        room.meta_data.fake_answers = ["Decoy"]
        manager = ProbeManager(room)
        ctx = Context(room_id="room", user_id="host", user_name="host", data={})
        await get_vote_choices(manager, ctx)
        payload = manager.broadcasts[-1]["data"]["choices"]
        assert all(set(choice) == {"id", "text"} for choice in payload)
        assert [choice["id"] for choice in payload] == [
            choice["id"] for choice in room.meta_data.voting_choices
        ]
        cancel_phase_timer(room)

    asyncio.run(scenario())


def test_clear_data_removes_round_data_but_keeps_scores():
    room = vote_room()
    room.players["host"].score = 7
    room.meta_data.voting_results["host"] = "correct"
    clear_data(room)
    assert room.meta_data.active_question is None
    assert room.meta_data.sumbitted_bluffs == {}
    assert room.meta_data.voting_results == {}
    assert room.meta_data.voting_choices == []
    assert room.players["host"].score == 7


def test_entering_next_round_clears_round_data_but_keeps_scores(monkeypatch):
    async def scenario():
        room = vote_room()
        room.meta_data.phase.cycle()
        room.meta_data.phase.cycle()
        room.players["host"].score = 7
        room.meta_data.voting_results["host"] = "correct"
        manager = ProbeManager(room)

        async def categories(_language):
            return [{"id": 1, "name": "Science", "image_url": None}]

        monkeypatch.setattr(events, "load_categories", categories)
        await advance_phase(manager, "room", RoomPhase.PODIUM)
        assert room.meta_data.phase.current_state == RoomPhase.CATEGORY
        assert room.meta_data.active_question is None
        assert room.meta_data.sumbitted_bluffs == {}
        assert room.meta_data.voting_results == {}
        assert room.meta_data.voting_choices == []
        assert room.players["host"].score == 7
        cancel_phase_timer(room)

    asyncio.run(scenario())


def test_rooms_have_independent_phase_and_mutable_state():
    first = vote_room()
    second = vote_room()
    first.meta_data.phase.cycle()
    first.meta_data.voting_results["host"] = "correct"
    assert second.meta_data.phase.current_state == RoomPhase.VOTE
    assert second.meta_data.voting_results == {}
    assert first.meta_data.state_lock is not second.meta_data.state_lock


def test_category_id_must_be_an_integer_before_database_access():
    async def scenario():
        room = vote_room()
        phase = RoomPhase()
        phase.start()
        room.meta_data.phase = phase
        manager = ProbeManager(room)
        ctx = Context(
            room_id="room",
            user_id="host",
            user_name="host",
            data={"category": {"id": "1", "name": "Science"}},
        )
        with pytest.raises(GameError) as caught:
            await get_question(manager, ctx)
        assert caught.value.error_code == "INVALID_PAYLOAD"
        assert room.meta_data.phase.current_state == RoomPhase.CATEGORY

    asyncio.run(scenario())
