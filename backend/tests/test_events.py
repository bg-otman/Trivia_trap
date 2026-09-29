import asyncio
from copy import deepcopy
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import asyncpg
import pytest
from fastapi import WebSocket

import engine.events as events
from engine.events import (
    get_question,
    get_vote_choices,
    phase_timer,
    process_event,
    reveal_results,
    submit_vote,
)
from engine.room_models import PlayerInfo, Room, RoomMetaData, RoomPhase, RoomSettings
from engine.utils import Context, GameError, clear_data


@pytest.fixture(autouse=True)
def prevent_database_access(monkeypatch):
    connection = AsyncMock(side_effect=AssertionError("Tests must not connect to a database"))
    monkeypatch.setattr(asyncpg, "connect", connection)
    yield
    connection.assert_not_called()


def player(player_id):
    names = {"host": "Amine", "p2": "Sara", "p3": "Youssef"}
    ws = WebSocket({"type": "websocket"}, AsyncMock(), AsyncMock())
    return PlayerInfo(ws=ws, name=names[player_id], avatar_url=f"/{player_id}.png")


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
        players={pid: player(pid) for pid in ("host", "p2", "p3")},
    )


def manager_for(room):
    return SimpleNamespace(
        rooms={"room": room}, broadcast=AsyncMock(), send_to_player=AsyncMock()
    )


def context(player_id="host", choice_id="correct"):
    return Context(
        room_id="room", user_id=player_id, user_name=player_id,
        data={"choice_id": choice_id},
    )


async def cleanup_timer(room):
    if room.meta_data.timer_task is not None:
        room.meta_data.timer_task.cancel()
        await asyncio.gather(room.meta_data.timer_task, return_exceptions=True)


def test_submit_vote_accepts_and_records_once():
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        await submit_vote(manager, context())
        assert room.meta_data.voting_results == {"host": "correct"}
        manager.send_to_player.assert_awaited_once_with(
            {"event": "VOTE_SUBMITTED", "data": {"player_id": "host"}}, "room", "host"
        )
        manager.broadcast.assert_not_awaited()
        with pytest.raises(GameError) as caught:
            await submit_vote(manager, context("host", "decoy"))
        assert caught.value.error_code == "ALREADY_VOTED"
        assert room.meta_data.voting_results == {"host": "correct"}
        assert manager.send_to_player.await_count == 1

    asyncio.run(scenario())


@pytest.mark.parametrize(
    ("player_id", "choice_id", "error_code"),
    [
        pytest.param("p2", "bluff-p2", "SELF_VOTE", id="self-vote"),
        pytest.param("p2", "missing", "INVALID_CHOICE", id="unknown-choice"),
        pytest.param("p2", "old-round-id", "INVALID_CHOICE", id="old-choice"),
        pytest.param("outside", "correct", "NOT_IN_ROOM", id="outside-player"),
        pytest.param("p2", 1, "INVALID_CHOICE", id="integer-choice"),
        pytest.param("p2", ["correct"], "INVALID_CHOICE", id="list-choice"),
        pytest.param("p2", {"id": "correct"}, "INVALID_CHOICE", id="dict-choice"),
        pytest.param("p2", None, "INVALID_PAYLOAD", id="null-choice"),
    ],
)
def test_submit_vote_rejects_invalid_votes_without_recording(player_id, choice_id, error_code):
    async def scenario():
        room = vote_room()
        room.meta_data.voting_results["host"] = "correct"
        before = room.meta_data.voting_results.copy()
        manager = manager_for(room)
        with pytest.raises(GameError) as caught:
            await submit_vote(manager, context(player_id, choice_id))
        assert caught.value.error_code == error_code
        assert room.meta_data.voting_results == before
        manager.send_to_player.assert_not_awaited()
        manager.broadcast.assert_not_awaited()

    asyncio.run(scenario())


def test_submit_vote_rejects_missing_choice():
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        ctx = context()
        ctx.data = {}
        with pytest.raises(GameError) as caught:
            await submit_vote(manager, ctx)
        assert caught.value.error_code == "INVALID_PAYLOAD"
        assert room.meta_data.voting_results == {}
        manager.send_to_player.assert_not_awaited()
        manager.broadcast.assert_not_awaited()

    asyncio.run(scenario())


def test_process_event_routes_vote_and_rejects_outside_player():
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        await process_event(manager, "room", "host", "Amine", "SUBMIT_VOTE", {"choice_id": "correct"})
        with pytest.raises(GameError) as caught:
            await process_event(manager, "room", "outside", "Other", "SUBMIT_VOTE", {"choice_id": "correct"})
        assert caught.value.error_code == "PLAYER_NOT_FOUND"
        assert room.meta_data.voting_results == {"host": "correct"}
        assert manager.send_to_player.await_count == 1

    asyncio.run(scenario())


@pytest.mark.parametrize("order", [("p2", "p3", "host"), ("host", "p2", "p3"), ("host", "p3", "p2")])
def test_any_player_can_be_the_last_voter(order):
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        selected = {"host": "bluff-p2", "p2": "correct", "p3": "decoy"}
        for pid in order:
            await submit_vote(manager, context(pid, selected[pid]))
        assert room.meta_data.phase.current_state == RoomPhase.REVEAL
        manager.broadcast.assert_awaited_once()
        assert manager.broadcast.call_args.args[0]["event"] == "RESULTS_REVEALED"
        assert room.meta_data.voting_results == selected
        assert room.players["p2"].score == 3

    asyncio.run(scenario())


def test_concurrent_votes_reveal_once_and_apply_points_once():
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        await asyncio.gather(
            submit_vote(manager, context("host", "bluff-p2")),
            submit_vote(manager, context("p2", "correct")),
            submit_vote(manager, context("p3", "decoy")),
        )
        manager.broadcast.assert_awaited_once()
        assert manager.broadcast.call_args.args[0]["event"] == "RESULTS_REVEALED"
        assert room.players["p2"].score == 3

    asyncio.run(scenario())


def test_concurrent_duplicate_vote_is_rejected():
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        results = await asyncio.gather(
            submit_vote(manager, context()),
            submit_vote(manager, context("host", "decoy")),
            return_exceptions=True,
        )
        assert results[0] is None
        assert isinstance(results[1], GameError)
        assert results[1].error_code == "ALREADY_VOTED"
        assert room.meta_data.voting_results == {"host": "correct"}
        assert manager.send_to_player.await_count == 1

    asyncio.run(scenario())


@pytest.mark.parametrize("votes", [{}, {"host": "correct"}], ids=["zero-votes", "partial-votes"])
def test_vote_timer_reveals_with_zero_or_partial_votes(votes):
    async def scenario():
        room = vote_room()
        room.meta_data.voting_results.update(votes)
        manager = manager_for(room)
        room.meta_data.timer_task = asyncio.create_task(phase_timer(manager, context(), 0))
        await asyncio.wait_for(room.meta_data.timer_task, 1)
        assert room.meta_data.phase.current_state == RoomPhase.REVEAL
        manager.broadcast.assert_awaited_once()
        assert manager.broadcast.call_args.args[0]["event"] == "RESULTS_REVEALED"
        assert room.players["host"].score == (1 if votes else 0)
        assert room.players["p2"].score == room.players["p3"].score == 0

    asyncio.run(scenario())


def test_last_vote_cancels_timer_without_double_scoring():
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        await submit_vote(manager, context("host", "bluff-p2"))
        await submit_vote(manager, context("p2", "correct"))
        timer = asyncio.create_task(phase_timer(manager, context(), 3600))
        room.meta_data.timer_task = timer
        try:
            await asyncio.sleep(0)
            await submit_vote(manager, context("p3", "decoy"))
            await asyncio.wait_for(timer, 1)
            assert timer.done()
            assert room.meta_data.phase.current_state == RoomPhase.REVEAL
            assert room.players["p2"].score == 3
            manager.broadcast.assert_awaited_once()
        finally:
            await cleanup_timer(room)

    asyncio.run(scenario())


def test_voting_broadcast_hides_answer_metadata_and_reuses_choice_ids():
    async def scenario():
        room = vote_room()
        room.meta_data.voting_choices.clear()
        room.meta_data.fake_answers = ["Decoy"]
        manager = manager_for(room)
        try:
            await get_vote_choices(manager, context())
            manager.broadcast.assert_awaited_once()
            message = manager.broadcast.call_args.args[0]
            assert message["event"] == "PHASE_VOTING"
            public = message["data"]["choices"]
            internal = room.meta_data.voting_choices
            assert public
            assert [choice["id"] for choice in public] == [choice["id"] for choice in internal]
            assert all("author_ids" in choice and "is_correct" in choice for choice in internal)
            assert all(set(choice) == {"id", "text"} for choice in public), (
                "PHASE_VOTING must not expose author_ids or is_correct"
            )
        finally:
            await cleanup_timer(room)

    asyncio.run(scenario())


def test_reveal_results_uses_current_signature_and_broadcasts_payload(monkeypatch):
    async def scenario():
        room = vote_room()
        room.meta_data.voting_results.update({"host": "bluff-p2", "p2": "correct", "p3": "decoy"})
        manager = manager_for(room)
        calculation = Mock(wraps=events.calculate_results)
        monkeypatch.setattr(events, "calculate_results", calculation)
        original_choices = deepcopy(room.meta_data.voting_choices)
        await reveal_results(manager, context())
        calculation.assert_called_once_with(
            votes=room.meta_data.voting_results,
            players=room.players,
            voting_choices=room.meta_data.voting_choices,
        )
        manager.broadcast.assert_awaited_once()
        message = manager.broadcast.call_args.args[0]
        assert message["event"] == "RESULTS_REVEALED"
        result = message["data"]
        assert set(result) == {"choices", "leaderboard", "round", "total_rounds"}
        assert result["round"] == result["total_rounds"] == 1
        assert room.meta_data.current_round == 2
        assert room.meta_data.podium == result["leaderboard"]
        assert result["leaderboard"][0] == {"username": "Sara", "score": 3, "avatar_url": "/p2.png"}
        assert room.meta_data.voting_choices == original_choices

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


def test_get_question_clears_previous_round_but_keeps_scores(monkeypatch):
    async def scenario():
        room = vote_room()
        phase = RoomPhase()
        phase.start()
        room.meta_data.phase = phase
        room.players["host"].score = 7
        room.meta_data.voting_results["host"] = "correct"
        manager = manager_for(room)
        load = AsyncMock(return_value={
            "id": 42, "question": "New question", "correct_answer": "New truth",
            "fake_answers": ["New decoy"], "image_url": None,
        })
        monkeypatch.setattr(events, "load_question", load)
        ctx = context()
        ctx.data = {"category": {"id": 1, "name": "Science"}}
        try:
            await get_question(manager, ctx)
            load.assert_awaited_once_with(1, "en")
            assert room.meta_data.phase.current_state == RoomPhase.QUESTION
            assert room.meta_data.active_question == "New question"
            assert room.meta_data.correct_answer == "New truth"
            assert room.meta_data.sumbitted_bluffs == {}
            assert room.meta_data.voting_results == {}
            assert room.meta_data.voting_choices == []
            assert room.players["host"].score == 7
        finally:
            await cleanup_timer(room)

    asyncio.run(scenario())


def test_rooms_have_independent_phase_and_mutable_state():
    first = vote_room()
    second = vote_room()
    first.meta_data.phase.cycle()
    first.meta_data.voting_results["host"] = "correct"
    first.meta_data.voting_choices[1]["author_ids"].append("host")
    assert second.meta_data.phase.current_state == RoomPhase.VOTE
    assert second.meta_data.voting_results == {}
    assert second.meta_data.voting_choices[1]["author_ids"] == ["p2"]
