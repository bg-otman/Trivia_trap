import asyncio
import json
from copy import deepcopy
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import asyncpg
import pytest
from fastapi import WebSocket
from fastapi.testclient import TestClient
from websockets.asyncio.client import connect as websocket_connect

import engine.events as events
from engine.events import (
    get_question,
    get_vote_choices,
    phase_timer,
    process_event,
    reveal_results,
    submit_vote,
    to_next_phase,
)
from engine.room_models import PlayerInfo, Room, RoomMetaData, RoomPhase, RoomSettings
from engine.utils import Context, GameError, clear_data
import engine.room_manager as room_manager
from main import app
from conftest import tcp_server
from engine.identity import authenticated_player


@pytest.fixture(autouse=True)
def prevent_database_access(monkeypatch):
    connection = AsyncMock(side_effect=AssertionError("Tests must not connect to a database"))
    monkeypatch.setattr(asyncpg, "connect", connection)
    # Legacy calculation tests isolate persistence and authentication explicitly.
    # Real PostgreSQL + trusted identity integration is tested in test_persistence.py.
    monkeypatch.setattr(events, "save_round_achievements", AsyncMock(return_value={"newly_saved": {}, "historical": {}}))
    monkeypatch.setattr(events, "save_game_results", AsyncMock(return_value={"newly_saved": {}, "historical": {}}))
    async def test_identity(ws: WebSocket):
        pid = ws.query_params["user_id"]
        uid = {"host": 1, "p2": 2, "p3": 3}[pid]
        return SimpleNamespace(user_id=uid, player_id=pid, username={"host": "Amine", "p2": "Sara", "p3": "Youssef"}[pid])
    app.dependency_overrides[authenticated_player] = test_identity
    yield
    app.dependency_overrides.pop(authenticated_player, None)
    connection.assert_not_called()


def player(player_id):
    names = {"host": "Amine", "p2": "Sara", "p3": "Youssef", "late": "Late"}
    ws = WebSocket({"type": "websocket"}, AsyncMock(), AsyncMock())
    uid = {"host": 1, "p2": 2, "p3": 3, "late": 4}[player_id]
    ws.state.authenticated_user_id = uid
    return PlayerInfo(ws=ws, name=names[player_id], user_id=uid, avatar_url=f"/{player_id}.png")


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


async def start_on_fire_match(room, manager, monkeypatch):
    room.meta_data.phase = RoomPhase()
    monkeypatch.setattr(events, "load_categories", AsyncMock(return_value=[{"id": 1, "name": "Science"}]))
    await to_next_phase(manager, context())
    await cleanup_timer(room)
    room.meta_data.timer_task = None


async def reveal_on_fire_round(room, manager, votes, choices=None):
    clear_data(room)
    room.meta_data.phase = phase_at_vote()
    room.meta_data.voting_choices = voting_choices() if choices is None else choices
    room.meta_data.voting_results = votes
    await to_next_phase(manager, context())


def create_default_room(rooms, room_id):
    """Use the production creation path without supplying or replacing phase."""
    ws = WebSocket({"type": "websocket"}, AsyncMock(), AsyncMock())
    events.join_room(rooms, ws, room_id, room_id, room_id)
    return rooms[room_id]


def test_new_rooms_have_different_default_phase_objects():
    rooms = {}
    first = create_default_room(rooms, "first")
    second = create_default_room(rooms, "second")

    assert first.meta_data.phase is not second.meta_data.phase
    assert first.meta_data.phase.current_state == RoomPhase.LOBBY
    assert second.meta_data.phase.current_state == RoomPhase.LOBBY


def test_room_transitions_do_not_change_another_room():
    rooms = {}
    first = create_default_room(rooms, "first").meta_data.phase
    second = create_default_room(rooms, "second").meta_data.phase

    first.start()
    assert first.current_state == RoomPhase.CATEGORY
    assert second.current_state == RoomPhase.LOBBY
    first.cycle()
    assert first.current_state == RoomPhase.QUESTION
    assert second.current_state == RoomPhase.LOBBY

    second.start()
    assert second.current_state == RoomPhase.CATEGORY
    assert first.current_state == RoomPhase.QUESTION
    first.cycle()
    assert first.current_state == RoomPhase.VOTE
    assert second.current_state == RoomPhase.CATEGORY


def test_room_phases_do_not_share_their_internal_state_model():
    rooms = {}
    first = create_default_room(rooms, "first").meta_data.phase
    second = create_default_room(rooms, "second").meta_data.phase

    assert first.model is not second.model
    second_state = vars(second.model).copy()
    first.start()
    assert vars(second.model) == second_state
    assert getattr(first.model, first.state_field) == "CATEGORY"
    assert getattr(second.model, second.state_field) == "LOBBY"


def test_new_room_does_not_inherit_an_existing_rooms_phase():
    rooms = {}
    first = create_default_room(rooms, "first").meta_data.phase
    first.start()
    first.cycle()

    later = create_default_room(rooms, "later").meta_data.phase
    assert later is not first
    assert later.current_state == RoomPhase.LOBBY
    assert first.current_state == RoomPhase.QUESTION


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
            correct_answer_streaks=room.meta_data.correct_answer_streaks,
            truth_seeker_announced=room.meta_data.truth_seeker_announced,
            correct_answer_totals=room.meta_data.correct_answer_totals,
            einstein_announced=room.meta_data.einstein_announced,
        )
        manager.broadcast.assert_awaited_once()
        message = manager.broadcast.call_args.args[0]
        assert message["event"] == "RESULTS_REVEALED"
        result = message["data"]
        assert set(result) == {"choices", "leaderboard", "unlocked_achievements", "round", "total_rounds"}
        assert result["round"] == result["total_rounds"] == 1
        assert room.meta_data.current_round == 2
        assert room.meta_data.podium == result["leaderboard"]
        assert result["leaderboard"][0] == {"username": "Sara", "score": 3, "avatar_url": "/p2.png"}
        assert room.meta_data.voting_choices == original_choices

    asyncio.run(scenario())


def test_truth_seeker_unlocks_on_fifth_round_and_reveal_is_idempotent():
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        for round_number in range(1, 6):
            room.meta_data.voting_results = {"host": "correct", "p2": "decoy"}
            await reveal_results(manager, context())
            message = manager.broadcast.call_args.args[0]
            assert message["event"] == "RESULTS_REVEALED"
            assert message["data"]["round"] == round_number
            expected = ["LONE_GENIUS", "TRUTH_SEEKER"] if round_number == 5 else ["LONE_GENIUS"]
            assert message["data"]["unlocked_achievements"] == {"host": expected}
            assert room.meta_data.correct_answer_streaks == {"host": round_number, "p2": 0, "p3": 0}
            assert room.players["host"].score == round_number
            assert room.meta_data.current_round == round_number + 1

            await reveal_results(manager, context())
            assert manager.broadcast.await_count == round_number
            assert room.players["host"].score == round_number
            assert room.meta_data.correct_answer_streaks["host"] == round_number

            if round_number < 5:
                clear_data(room)
                room.meta_data.voting_choices = voting_choices()

        assert room.meta_data.truth_seeker_announced == {"host"}

        clear_data(room)
        room.meta_data.voting_choices = voting_choices()
        room.meta_data.voting_results = {"host": "decoy", "p2": "correct"}
        await reveal_results(manager, context())
        assert room.meta_data.correct_answer_streaks == {"host": 0, "p2": 1, "p3": 0}
        assert room.players["p2"].score == 1

        for _ in range(5):
            clear_data(room)
            room.meta_data.voting_choices = voting_choices()
            room.meta_data.voting_results = {"host": "correct"}
            await reveal_results(manager, context())
            assert "TRUTH_SEEKER" not in manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"].get("host", [])
        assert room.meta_data.correct_answer_streaks["host"] == 5
        assert room.players["host"].score == 10

    asyncio.run(scenario())


def test_truth_seeker_wrong_and_no_vote_reset_only_that_players_streak():
    async def scenario():
        room = vote_room()
        room.meta_data.correct_answer_streaks = {"host": 4, "p2": 4, "p3": 4}
        room.meta_data.voting_results = {"host": "decoy", "p2": "correct"}
        manager = manager_for(room)
        await reveal_results(manager, context())
        assert room.meta_data.correct_answer_streaks == {"host": 0, "p2": 5, "p3": 0}
        assert room.meta_data.truth_seeker_announced == {"p2"}
        assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
            "p2": ["LONE_GENIUS", "TRUTH_SEEKER"]
        }
        assert room.players["p2"].score == 1

    asyncio.run(scenario())


def test_truth_seeker_state_is_isolated_between_rooms():
    async def scenario():
        first = vote_room()
        second = vote_room()
        first.meta_data.correct_answer_streaks["host"] = 4
        first.meta_data.voting_results = {"host": "correct"}
        second.meta_data.voting_results = {"host": "correct"}
        first_manager = manager_for(first)
        second_manager = manager_for(second)
        await reveal_results(first_manager, context())
        await reveal_results(second_manager, context())
        assert first.meta_data.correct_answer_streaks["host"] == 5
        assert first.meta_data.truth_seeker_announced == {"host"}
        assert second.meta_data.correct_answer_streaks["host"] == 1
        assert second.meta_data.truth_seeker_announced == set()
        assert second_manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
            "host": ["LONE_GENIUS"]
        }

    asyncio.run(scenario())


def test_default_match_can_unlock_einstein_on_tenth_round(monkeypatch):
    async def scenario():
        room = vote_room()
        room.meta_data.settings = RoomSettings(bluff_time=10, vote_time=10)
        assert room.meta_data.settings.total_rounds == 10
        room.meta_data.phase = RoomPhase()
        manager = manager_for(room)
        monkeypatch.setattr(events, "load_categories", AsyncMock(return_value=[{"id": 1, "name": "Science"}]))
        question = {
            "id": 42, "question": "Question", "correct_answer": "Truth",
            "fake_answers": ["Decoy"], "image_url": None,
        }
        monkeypatch.setattr(events, "load_question", AsyncMock(side_effect=lambda *_: deepcopy(question)))
        try:
            await to_next_phase(manager, context())
            for round_number in range(1, 11):
                await get_question(manager, context())
                await to_next_phase(manager, context())
                correct_id = next(choice["id"] for choice in room.meta_data.voting_choices if choice["is_correct"])
                decoy_id = next(choice["id"] for choice in room.meta_data.voting_choices if not choice["is_correct"])
                await submit_vote(manager, context("host", correct_id))
                await submit_vote(manager, context("p2", decoy_id))
                await submit_vote(manager, context("p3", decoy_id))

                message = manager.broadcast.call_args.args[0]
                assert message["event"] == "RESULTS_REVEALED"
                expected_codes = ["LONE_GENIUS"]
                if round_number == 5:
                    expected_codes.append("TRUTH_SEEKER")
                if round_number == 10:
                    expected_codes.append("EINSTEIN")
                assert message["data"]["unlocked_achievements"] == {"host": expected_codes}
                assert room.meta_data.correct_answer_totals == {"host": round_number, "p2": 0, "p3": 0}
                assert room.players["host"].score == round_number
                assert room.players["p2"].score == room.players["p3"].score == 0

                broadcast_count = manager.broadcast.await_count
                await reveal_results(manager, context())
                assert manager.broadcast.await_count == broadcast_count
                assert room.meta_data.correct_answer_totals["host"] == round_number
                assert room.meta_data.correct_answer_streaks["host"] == round_number
                assert room.players["host"].score == round_number
                assert room.meta_data.current_round == round_number + 1

                await to_next_phase(manager, context())
                if round_number < 10:
                    assert room.meta_data.phase.current_state == RoomPhase.PODIUM
                    await to_next_phase(manager, context())
            assert room.meta_data.phase.current_state == RoomPhase.LOBBY
            assert room.meta_data.einstein_announced == {"host"}
        finally:
            await cleanup_timer(room)

    asyncio.run(scenario())


def test_einstein_total_survives_wrong_and_missing_votes_and_announces_once():
    async def scenario():
        room = vote_room()
        room.meta_data.settings.total_rounds = 15
        room.meta_data.correct_answer_totals["host"] = 8
        manager = manager_for(room)
        correct_rounds = 0
        for index, choice_id in enumerate(("correct", "decoy", None, "correct", "correct", None, "correct")):
            clear_data(room)
            room.meta_data.phase = phase_at_vote()
            room.meta_data.voting_choices = voting_choices()
            if choice_id is not None:
                room.meta_data.voting_results["host"] = choice_id
            await phase_timer(manager, context(), 0)
            correct_rounds += int(choice_id == "correct")
            assert room.meta_data.correct_answer_totals["host"] == 8 + correct_rounds
            assert room.players["host"].score == correct_rounds
            expected = ["LONE_GENIUS"] if choice_id == "correct" else []
            if index == 3:
                expected.append("EINSTEIN")
            assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == (
                {"host": expected} if expected else {}
            )
            await reveal_results(manager, context())
            assert manager.broadcast.await_count == index + 1
            assert room.meta_data.correct_answer_totals["host"] == 8 + correct_rounds
            assert room.players["host"].score == correct_rounds
        assert room.meta_data.einstein_announced == {"host"}
        assert room.meta_data.correct_answer_streaks["host"] == 1
        assert room.meta_data.truth_seeker_announced == set()

    asyncio.run(scenario())


def test_einstein_progress_is_independent_between_players_and_rooms():
    async def scenario():
        first = vote_room()
        second = vote_room()
        first.meta_data.correct_answer_totals = {"host": 9, "p2": 9, "p3": 6}
        first.meta_data.voting_results = {"host": "correct", "p2": "decoy"}
        second.meta_data.voting_results = {"host": "correct"}
        first_manager = manager_for(first)
        second_manager = manager_for(second)
        await reveal_results(first_manager, context())
        await reveal_results(second_manager, context())
        assert first.meta_data.correct_answer_totals == {"host": 10, "p2": 9, "p3": 6}
        assert first.meta_data.einstein_announced == {"host"}
        assert first.meta_data.correct_answer_streaks == {"host": 1, "p2": 0, "p3": 0}
        assert first_manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
            "host": ["LONE_GENIUS", "EINSTEIN"]
        }
        assert second.meta_data.correct_answer_totals == {"host": 1, "p2": 0, "p3": 0}
        assert second.meta_data.einstein_announced == set()
        assert second_manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
            "host": ["LONE_GENIUS"]
        }

    asyncio.run(scenario())


def test_new_match_resets_progress_and_both_announcement_sets(monkeypatch):
    async def scenario():
        room = vote_room()
        phase = RoomPhase()
        phase.start()
        for _ in range(4):
            phase.cycle()
        room.meta_data.phase = phase
        room.meta_data.current_round = 2
        room.meta_data.podium = [
            {"username": "Amine", "score": 5}, {"username": "Sara", "score": 1}
        ]
        room.meta_data.correct_answer_streaks["host"] = 5
        room.meta_data.truth_seeker_announced.add("host")
        room.meta_data.correct_answer_totals["host"] = 10
        room.meta_data.einstein_announced.add("host")
        room.meta_data.round_results_processed = True
        manager = manager_for(room)
        await events.podium(manager, context())
        assert room.meta_data.phase.current_state == RoomPhase.LOBBY
        assert room.meta_data.correct_answer_streaks == {"host": 5}
        assert room.meta_data.correct_answer_totals == {"host": 10}
        assert room.meta_data.einstein_announced == {"host"}
        monkeypatch.setattr(events, "load_categories", AsyncMock(return_value=[{"id": 1, "name": "Science"}]))
        try:
            await to_next_phase(manager, context())
            assert room.meta_data.phase.current_state == RoomPhase.CATEGORY
            assert room.meta_data.current_round == 1
            assert room.meta_data.correct_answer_streaks == {}
            assert room.meta_data.truth_seeker_announced == set()
            assert room.meta_data.correct_answer_totals == {}
            assert room.meta_data.einstein_announced == set()
            assert room.meta_data.round_results_processed is False
            assert all(player.on_fire_eligible for player in room.players.values())
            room.meta_data.phase = phase_at_vote()
            room.meta_data.correct_answer_streaks["host"] = 4
            room.meta_data.correct_answer_totals["host"] = 9
            room.meta_data.voting_results = {"host": "correct"}
            await reveal_results(manager, context())
            assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
                "host": ["LONE_GENIUS", "TRUTH_SEEKER", "EINSTEIN"]
            }
        finally:
            await cleanup_timer(room)

    asyncio.run(scenario())


def test_on_fire_at_match_end_preserves_scores_and_prevents_repeats(monkeypatch):
    async def scenario():
        room = vote_room()
        room.meta_data.settings.total_rounds = 2
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        await reveal_on_fire_round(room, manager, {"host": "correct", "p2": "correct", "p3": "decoy"})
        await to_next_phase(manager, context())
        assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {}

        # p2 does not vote, but receives two points from p3's vote on their bluff.
        await reveal_on_fire_round(room, manager, {"host": "correct", "p3": "bluff-p2"})
        result = manager.broadcast.call_args.args[0]
        assert result["data"]["unlocked_achievements"] == {"host": ["LONE_GENIUS"]}
        assert room.players["host"].on_fire_eligible
        assert room.players["p2"].on_fire_eligible
        before = {pid: p.score for pid, p in room.players.items()}
        assert before == {"host": 2, "p2": 3, "p3": 0}
        broadcasts = manager.broadcast.await_count
        await reveal_results(manager, context())
        assert manager.broadcast.await_count == broadcasts
        assert room.players["p2"].on_fire_eligible
        await to_next_phase(manager, context())
        message = manager.broadcast.call_args.args[0]
        assert message["event"] == "PHASE_PODIUM"
        assert message["data"]["unlocked_achievements"] == {
            "host": ["ON_FIRE"], "p2": ["ON_FIRE"]
        }
        assert room.meta_data.phase.current_state == RoomPhase.LOBBY
        await events.podium(manager, context())
        assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {}
        assert {pid: p.score for pid, p in room.players.items()} == before
        assert not any(p.on_fire_eligible for p in room.players.values())
        await start_on_fire_match(room, manager, monkeypatch)
        assert all(p.on_fire_eligible for p in room.players.values())

    asyncio.run(scenario())


@pytest.mark.parametrize(
    ("extra_votes", "expected"),
    [
        ({"host": "correct", "p2": "decoy", "p3": "decoy"}, {"host": ["ON_FIRE"]}),
        ({"host": "correct", "p3": "bluff-p2"}, {"host": ["ON_FIRE"], "p2": ["ON_FIRE"]}),
    ],
    ids=["zero-point-tiebreak-disqualifies", "positive-tiebreak-qualifies"],
)
def test_on_fire_waits_for_actual_end_and_counts_tiebreaks(monkeypatch, extra_votes, expected):
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        await reveal_on_fire_round(room, manager, {"host": "correct", "p2": "correct", "p3": "decoy"})
        await to_next_phase(manager, context())
        assert room.meta_data.phase.current_state == RoomPhase.PODIUM
        assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {}
        assert room.players["host"].on_fire_eligible and room.players["p2"].on_fire_eligible
        await reveal_on_fire_round(room, manager, extra_votes)
        await to_next_phase(manager, context())
        assert room.meta_data.current_round == 3
        assert room.meta_data.phase.current_state == RoomPhase.LOBBY
        assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == expected

    asyncio.run(scenario())


@pytest.mark.parametrize("reconnect", [False, True], ids=["still-disconnected", "reconnected"])
def test_on_fire_temporary_disconnect_preserves_eligibility(monkeypatch, reconnect):
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        participant = room.players["p2"]
        room_manager.RoomManager.mark_disconnected(manager, "p2", "room")
        await reveal_on_fire_round(room, manager, {"host": "correct", "p3": "bluff-p2"})
        assert participant.on_fire_eligible
        if reconnect:
            events.join_room(manager.rooms, player("p2").ws, "room", "p2", "Sara")
            assert room.players["p2"] is participant
            assert participant.is_present and participant.on_fire_eligible
        await to_next_phase(manager, context())
        assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
            "host": ["ON_FIRE"], "p2": ["ON_FIRE"]
        }

    asyncio.run(scenario())


@pytest.mark.parametrize("rejoin", [False, True], ids=["permanent-leave", "same-id-late-rejoin"])
def test_on_fire_excludes_late_joiners_and_permanent_leavers(monkeypatch, rejoin):
    async def scenario():
        room = vote_room()
        room.meta_data.settings.total_rounds = 2
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        # Even joining before the first results is late if the match already started.
        events.join_room(manager.rooms, player("late").ws, "room", "late", "Late")
        assert not room.players["late"].on_fire_eligible
        await reveal_on_fire_round(room, manager, {
            "host": "correct", "p2": "correct", "p3": "decoy", "late": "correct"
        })
        await to_next_phase(manager, context())
        assert room.players["p2"].on_fire_eligible
        departed = room.players["p2"]
        await room_manager.RoomManager.remove_connection(manager, "p2", "room")
        if rejoin:
            events.join_room(manager.rooms, player("p2").ws, "room", "p2", "Sara")
            assert room.players["p2"] is not departed
            assert not room.players["p2"].on_fire_eligible
        # The late player earns a point in every round but remains ineligible.
        # A vote on the host's bluff makes the final ranking untied.
        votes = {"host": "correct", "p3": "bluff-host", "late": "correct"}
        if rejoin:
            votes["p2"] = "correct"
        await reveal_on_fire_round(room, manager, votes, choices=voting_choices() + [
            {"id": "bluff-host", "text": "Host bluff", "author_ids": ["host"], "is_correct": False},
        ])
        assert room.players["late"].score == 2
        assert not room.players["late"].on_fire_eligible
        await to_next_phase(manager, context())
        assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
            "host": ["ON_FIRE"]
        }
        await start_on_fire_match(room, manager, monkeypatch)
        assert room.players["late"].on_fire_eligible

    asyncio.run(scenario())


def test_on_fire_progress_is_independent_between_rooms(monkeypatch):
    async def scenario():
        first, second = vote_room(), vote_room()
        first_manager, second_manager = manager_for(first), manager_for(second)
        await start_on_fire_match(first, first_manager, monkeypatch)
        await start_on_fire_match(second, second_manager, monkeypatch)
        await reveal_on_fire_round(first, first_manager, {"host": "correct"})
        assert first.players["host"].on_fire_eligible
        assert not first.players["p2"].on_fire_eligible
        assert all(p.on_fire_eligible for p in second.players.values())
        await reveal_on_fire_round(second, second_manager, {"p2": "correct"})
        await to_next_phase(first_manager, context())
        await to_next_phase(second_manager, context())
        assert first_manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {"host": ["ON_FIRE"]}
        assert second_manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {"p2": ["ON_FIRE"]}

    asyncio.run(scenario())


@pytest.mark.parametrize(("total_rounds", "midpoint"), [(10, 5), (5, 3)])
def test_remontada_snapshots_after_midpoint_scores_and_resets(monkeypatch, total_rounds, midpoint):
    async def scenario():
        room = vote_room()
        room.meta_data.settings.total_rounds = total_rounds
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        for participant in room.players.values():
            participant.name = "Same name"
        assert room.meta_data.remontada_midpoint_round == midpoint
        assert room.meta_data.remontada_last_player_ids is None
        for round_number in range(1, total_rounds + 1):
            if round_number < midpoint:
                votes = {pid: "correct" for pid in room.players}
            elif round_number == midpoint:
                # Everyone was tied before scoring this round.
                votes = {"host": "correct"}
            else:
                votes = {"p2": "correct", "host": "bluff-p2", "p3": "bluff-p2"}
            await reveal_on_fire_round(room, manager, votes)
            if round_number < midpoint:
                assert room.meta_data.remontada_last_player_ids is None
            else:
                assert room.meta_data.remontada_last_player_ids == {"p2", "p3"}
            if round_number == midpoint:
                assert [p.score for p in room.players.values()] == [midpoint, midpoint - 1, midpoint - 1]
                snapshot = room.meta_data.remontada_last_player_ids
                scores = [p.score for p in room.players.values()]
                broadcasts = manager.broadcast.await_count
                await reveal_results(manager, context())
                assert room.meta_data.remontada_last_player_ids is snapshot
                assert [p.score for p in room.players.values()] == scores
                assert manager.broadcast.await_count == broadcasts
            await to_next_phase(manager, context())
            expected = {"p2": ["REMONTADA_MASTER"]} if round_number == total_rounds else {}
            assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == expected
        assert room.meta_data.phase.current_state == RoomPhase.LOBBY
        scores = [p.score for p in room.players.values()]
        await events.podium(manager, context())
        assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {}
        assert [p.score for p in room.players.values()] == scores
        room.meta_data.settings.total_rounds = 3
        await start_on_fire_match(room, manager, monkeypatch)
        assert room.meta_data.remontada_midpoint_round == 2
        assert room.meta_data.remontada_last_player_ids is None
        assert all(p.remontada_eligible for p in room.players.values())
        # A previous match's snapshot cannot award anything before the new midpoint.
        await reveal_on_fire_round(room, manager, {"host": "correct"})
        assert room.meta_data.remontada_last_player_ids is None

    asyncio.run(scenario())


def test_remontada_midpoint_is_fixed_at_match_start(monkeypatch):
    async def scenario():
        room = vote_room()
        room.meta_data.settings.total_rounds = 5
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        # Even a subsequent settings mutation cannot move the captured midpoint.
        room.meta_data.settings.total_rounds = 10
        for _ in range(3):
            await reveal_on_fire_round(room, manager, {"host": "correct"})
            await to_next_phase(manager, context())
        assert room.meta_data.remontada_midpoint_round == 3
        assert room.meta_data.remontada_last_player_ids == {"p2", "p3"}

    asyncio.run(scenario())


def test_remontada_waits_through_tiebreaks_without_changing_snapshot(monkeypatch):
    async def scenario():
        room = vote_room()
        room.meta_data.settings.total_rounds = 2
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        votes_by_round = [
            {"host": "correct", "p3": "correct"},
            {"p2": "correct"},
            {"host": "correct", "p2": "correct"},
            {"p2": "correct"},
        ]
        for round_number, votes in enumerate(votes_by_round, 1):
            await reveal_on_fire_round(room, manager, votes)
            assert room.meta_data.remontada_midpoint_round == 1
            assert room.meta_data.remontada_last_player_ids == {"p2"}
            await to_next_phase(manager, context())
            if round_number < 4:
                assert room.meta_data.phase.current_state == RoomPhase.PODIUM
                assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {}
            else:
                assert room.meta_data.phase.current_state == RoomPhase.LOBBY
                assert manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
                    "p2": ["REMONTADA_MASTER"]
                }

    asyncio.run(scenario())


@pytest.mark.parametrize(
    "membership",
    ["late", "rejoin-before-midpoint", "rejoin-after-midpoint", "leave", "disconnected", "reconnected"],
)
def test_remontada_membership_and_reconnections(monkeypatch, membership):
    async def scenario():
        room = vote_room()
        room.meta_data.settings.total_rounds = 2
        if membership == "late":
            del room.players["p2"]
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        if membership == "rejoin-before-midpoint":
            await room_manager.RoomManager.remove_connection(manager, "p2", "room")
        if membership in {"late", "rejoin-before-midpoint"}:
            events.join_room(manager.rooms, player("p2").ws, "room", "p2", "Sara")
            assert not room.players["p2"].remontada_eligible
        await reveal_on_fire_round(room, manager, {"host": "correct", "p3": "correct"})
        assert room.meta_data.remontada_last_player_ids == {"p2"}
        await to_next_phase(manager, context())
        if membership in {"leave", "rejoin-after-midpoint"}:
            await room_manager.RoomManager.remove_connection(manager, "p2", "room")
            if membership == "rejoin-after-midpoint":
                events.join_room(manager.rooms, player("p2").ws, "room", "p2", "Sara")
                assert not room.players["p2"].remontada_eligible
        if membership in {"disconnected", "reconnected"}:
            participant = room.players["p2"]
            room_manager.RoomManager.mark_disconnected(manager, "p2", "room")
            if membership == "reconnected":
                events.join_room(manager.rooms, player("p2").ws, "room", "p2", "Sara")
                assert room.players["p2"] is participant
            assert room.players["p2"].remontada_eligible
        if membership == "leave":
            votes = {"host": "correct"}
        else:
            # A disconnected player can win through bluff points without voting.
            votes = {"host": "bluff-p2", "p3": "bluff-p2"}
            if membership != "disconnected":
                votes["p2"] = "correct"
        await reveal_on_fire_round(room, manager, votes)
        await to_next_phase(manager, context())
        awards = manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"]
        if membership in {"disconnected", "reconnected"}:
            assert awards == {"p2": ["REMONTADA_MASTER"]}
        else:
            assert all("REMONTADA_MASTER" not in codes for codes in awards.values())
        assert room.meta_data.phase.current_state == RoomPhase.LOBBY

    asyncio.run(scenario())


def test_remontada_rooms_are_independent_and_empty_snapshot_stays_empty(monkeypatch):
    async def scenario():
        first, second = vote_room(), vote_room()
        first.meta_data.settings.total_rounds = second.meta_data.settings.total_rounds = 2
        first_manager, second_manager = manager_for(first), manager_for(second)
        await start_on_fire_match(first, first_manager, monkeypatch)
        await start_on_fire_match(second, second_manager, monkeypatch)
        await reveal_on_fire_round(first, first_manager, {"host": "correct", "p3": "correct"})
        assert first.meta_data.remontada_last_player_ids == {"p2"}
        assert second.meta_data.remontada_last_player_ids is None
        await reveal_on_fire_round(second, second_manager, {pid: "correct" for pid in second.players})
        assert second.meta_data.remontada_last_player_ids == set()
        for room, manager in ((first, first_manager), (second, second_manager)):
            await to_next_phase(manager, context())
            await reveal_on_fire_round(room, manager, {"host": "bluff-p2", "p2": "correct", "p3": "bluff-p2"})
            await to_next_phase(manager, context())
        assert first_manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {
            "p2": ["REMONTADA_MASTER"]
        }
        assert second.meta_data.remontada_last_player_ids == set()
        assert second_manager.broadcast.call_args.args[0]["data"]["unlocked_achievements"] == {"p2": ["ON_FIRE"]}
        assert second.players["p2"].remontada_eligible  # First room's announcement is independent.

    asyncio.run(scenario())


def test_truth_seeker_reaches_player_over_real_websocket(monkeypatch):
    live_manager = room_manager.RoomManager()
    monkeypatch.setattr(room_manager, "manager", live_manager)
    with TestClient(app) as client:
        with client.websocket_connect("/room/room?user_id=host&user_name=Amine") as host_ws:
            with client.websocket_connect("/room/room?user_id=p2&user_name=Sara") as p2_ws:
                with client.websocket_connect("/room/room?user_id=p3&user_name=Youssef") as p3_ws:
                    for _ in range(3):
                        assert host_ws.receive_json()["event"] == "LOBBY_UPDATE"
                    for _ in range(2):
                        assert p2_ws.receive_json()["event"] == "LOBBY_UPDATE"
                    assert p3_ws.receive_json()["event"] == "LOBBY_UPDATE"

                    room = live_manager.rooms["room"]
                    room.meta_data.phase = phase_at_vote()
                    room.meta_data.voting_choices = voting_choices()
                    room.meta_data.correct_answer_streaks["host"] = 4

                    host_ws.send_json({"event": "SUBMIT_VOTE", "data": {"choice_id": "correct"}})
                    assert host_ws.receive_json()["event"] == "VOTE_SUBMITTED"
                    p2_ws.send_json({"event": "SUBMIT_VOTE", "data": {"choice_id": "decoy"}})
                    assert p2_ws.receive_json()["event"] == "VOTE_SUBMITTED"
                    p3_ws.send_json({"event": "SUBMIT_VOTE", "data": {"choice_id": "decoy"}})

                    messages = [ws.receive_json() for ws in (host_ws, p2_ws, p3_ws)]
                    assert all(message["event"] == "RESULTS_REVEALED" for message in messages)
                    assert all(message["data"]["unlocked_achievements"] == {
                        "host": ["LONE_GENIUS", "TRUTH_SEEKER"]
                    } for message in messages)
                    assert room.players["host"].score == 1


@pytest.mark.parametrize(
    ("finish_match", "remontada"), [(False, False), (True, False), (True, True)],
    ids=["round-awards", "on-fire-at-match-end", "remontada-and-on-fire"],
)
def test_einstein_and_truth_seeker_broadcast_over_tcp_websocket(monkeypatch, finish_match, remontada):
    async def receive(ws):
        return json.loads(await asyncio.wait_for(ws.recv(), 2))

    async def scenario():
        live_manager = room_manager.RoomManager()
        monkeypatch.setattr(room_manager, "manager", live_manager)
        async with tcp_server(app) as base_uri:
            uri = f"{base_uri}/room/room"
            async with websocket_connect(f"{uri}?user_id=host&user_name=Amine") as host_ws:
                async with websocket_connect(f"{uri}?user_id=p2&user_name=Sara") as p2_ws:
                    async with websocket_connect(f"{uri}?user_id=p3&user_name=Youssef") as p3_ws:
                        for ws, count in ((host_ws, 3), (p2_ws, 2), (p3_ws, 1)):
                            for _ in range(count):
                                assert (await receive(ws))["event"] == "LOBBY_UPDATE"

                        room = live_manager.rooms["room"]
                        if finish_match:
                            room.meta_data.settings.total_rounds = 2 if remontada else 1
                            monkeypatch.setattr(events, "load_categories", AsyncMock(return_value=[{"id": 1, "name": "Science"}]))
                            host_message = {"event": "NEXT_PHASE", "data": {}}
                            await host_ws.send(json.dumps(host_message))
                            for ws in (host_ws, p2_ws, p3_ws):
                                message = await receive(ws)
                                assert message["event"] == "PHASE_CATEGORY", message
                            await cleanup_timer(room)
                        if remontada:
                            room.meta_data.phase = phase_at_vote()
                            room.meta_data.voting_choices = voting_choices() + [
                                {"id": "bluff-p3", "text": "Third bluff", "author_ids": ["p3"], "is_correct": False},
                            ]
                            # Midpoint: host earns 1; both opponents earn 2.
                            for ws, choice_id in ((host_ws, "correct"), (p2_ws, "bluff-p3")):
                                await ws.send(json.dumps({"event": "SUBMIT_VOTE", "data": {"choice_id": choice_id}}))
                                assert (await receive(ws))["event"] == "VOTE_SUBMITTED"
                            await p3_ws.send(json.dumps({"event": "SUBMIT_VOTE", "data": {"choice_id": "bluff-p2"}}))
                            for ws in (host_ws, p2_ws, p3_ws):
                                message = await receive(ws)
                                assert message["event"] == "RESULTS_REVEALED"
                                assert message["data"]["unlocked_achievements"] == {"host": ["LONE_GENIUS"]}
                            assert room.meta_data.remontada_last_player_ids == {"host"}
                            assert [p.score for p in room.players.values()] == [1, 2, 2]
                            await host_ws.send(json.dumps({"event": "NEXT_PHASE", "data": {}}))
                            for ws in (host_ws, p2_ws, p3_ws):
                                message = await receive(ws)
                                assert message["event"] == "PHASE_PODIUM"
                                assert message["data"]["unlocked_achievements"] == {}
                            clear_data(room)
                        room.meta_data.phase = phase_at_vote()
                        room.meta_data.voting_choices = voting_choices()
                        if remontada:
                            room.meta_data.voting_choices.append(
                                {"id": "bluff-host", "text": "Host bluff", "author_ids": ["host"], "is_correct": False}
                            )
                        room.meta_data.correct_answer_streaks["host"] = 4
                        room.meta_data.correct_answer_totals["host"] = 9
                        opponent_choice = "bluff-host" if remontada else "decoy"
                        for ws, choice_id in ((host_ws, "correct"), (p2_ws, opponent_choice)):
                            await ws.send(json.dumps({"event": "SUBMIT_VOTE", "data": {"choice_id": choice_id}}))
                            assert (await receive(ws))["event"] == "VOTE_SUBMITTED"
                        await p3_ws.send(json.dumps({"event": "SUBMIT_VOTE", "data": {"choice_id": opponent_choice}}))

                        for ws in (host_ws, p2_ws, p3_ws):
                            message = await receive(ws)
                            assert message["event"] == "RESULTS_REVEALED"
                            assert message["data"]["unlocked_achievements"] == {
                                "host": ["LONE_GENIUS"] + (["PERFECT_TRAP"] if remontada else [])
                                + ["TRUTH_SEEKER", "EINSTEIN"]
                            }
                        assert room.meta_data.correct_answer_totals["host"] == 10
                        assert room.meta_data.correct_answer_streaks["host"] == 5
                        assert room.players["host"].score == (6 if remontada else 1)
                        if finish_match:
                            await host_ws.send(json.dumps({"event": "NEXT_PHASE", "data": {}}))
                            for ws in (host_ws, p2_ws, p3_ws):
                                message = await receive(ws)
                                assert message["event"] == "PHASE_PODIUM"
                                assert message["data"]["unlocked_achievements"] == {
                                    "host": ["ON_FIRE"] + (["REMONTADA_MASTER"] if remontada else [])
                                }
                            assert room.meta_data.phase.current_state == RoomPhase.LOBBY

    asyncio.run(scenario())


def test_clear_data_removes_round_data_but_keeps_scores():
    room = vote_room()
    room.players["host"].score = 7
    room.meta_data.voting_results["host"] = "correct"
    room.meta_data.correct_answer_streaks["host"] = 4
    room.meta_data.truth_seeker_announced.add("p2")
    room.meta_data.correct_answer_totals["host"] = 9
    room.meta_data.einstein_announced.add("p2")
    room.meta_data.round_results_processed = True
    clear_data(room)
    assert room.meta_data.active_question is None
    assert room.meta_data.sumbitted_bluffs == {}
    assert room.meta_data.voting_results == {}
    assert room.meta_data.voting_choices == []
    assert room.players["host"].score == 7
    assert room.meta_data.correct_answer_streaks == {"host": 4}
    assert room.meta_data.truth_seeker_announced == {"p2"}
    assert room.meta_data.correct_answer_totals == {"host": 9}
    assert room.meta_data.einstein_announced == {"p2"}
    assert room.meta_data.round_results_processed is False


def test_get_question_clears_previous_round_but_keeps_scores(monkeypatch):
    async def scenario():
        room = vote_room()
        phase = RoomPhase()
        phase.start()
        room.meta_data.phase = phase
        room.players["host"].score = 7
        room.meta_data.voting_results["host"] = "correct"
        room.meta_data.correct_answer_streaks["host"] = 4
        room.meta_data.correct_answer_totals["host"] = 9
        room.meta_data.round_results_processed = True
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
            assert room.meta_data.correct_answer_streaks == {"host": 4}
            assert room.meta_data.correct_answer_totals == {"host": 9}
            assert room.meta_data.round_results_processed is False
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


def test_timer_broadcasts_persistence_failure_and_keeps_retry_state(monkeypatch):
    async def scenario():
        room = vote_room()
        manager = manager_for(room)
        await start_on_fire_match(room, manager, monkeypatch)
        room.meta_data.phase = phase_at_vote()
        room.meta_data.voting_choices = voting_choices()
        room.meta_data.voting_results = {"host": "correct"}
        monkeypatch.setattr(events, "save_round_achievements", AsyncMock(side_effect=RuntimeError("offline")))
        await phase_timer(manager, context(), 0)
        message = manager.broadcast.call_args.args[0]
        assert message["event"] == "ERROR"
        assert message["data"]["code"] == "PERSISTENCE_FAILED"
        assert room.meta_data.pending_round is not None
        assert room.players["host"].score == 1
        assert room.meta_data.round_results_processed
    asyncio.run(scenario())
