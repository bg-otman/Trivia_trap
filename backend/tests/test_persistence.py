"""Real PostgreSQL tests: only an explicitly separate local achievement_test DB."""
import asyncio
from contextlib import asynccontextmanager, AsyncExitStack
from datetime import datetime, timezone
import json
import os
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4
import pytest
from alembic import command
from alembic.config import Config
from fastapi import WebSocket, WebSocketException
from sqlalchemy import func, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from websockets.asyncio.client import connect
from websockets.exceptions import InvalidStatus
from conftest import tcp_server
from dataProcessing.achievements import AchievementCode as A, evaluate_historical_achievements, evaluate_collector
from dataProcessing import services
from dataProcessing.models import Game, GamePlayerResult, GamePersistenceEvent, User, UserAchievement
from engine import identity, events, room_manager
from engine.room_models import Room, RoomMetaData, RoomSettings, RoomPhase, PlayerInfo
from engine.utils import Context, GameError, clear_data
from main import app


@asynccontextmanager
async def database(monkeypatch):
    url = os.environ.get("ACHIEVEMENT_TEST_DATABASE_URL")
    if not url:
        pytest.skip("ACHIEVEMENT_TEST_DATABASE_URL required for real PostgreSQL tests")
    parsed = make_url(url)
    if parsed.host not in {"127.0.0.1", "localhost"} or not parsed.database.startswith("achievement_test"):
        pytest.fail("Refusing anything except a separate local achievement_test database")
    schema = "achievement_test_" + uuid4().hex
    engine = create_async_engine(url, poolclass=NullPool, connect_args={"server_settings": {"search_path": schema}})
    try:
        async with engine.begin() as connection:
            await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
            def migrate(sync):
                root = Path(__file__).resolve().parents[1]
                cfg = Config(str(root / "alembic.ini"))
                cfg.set_main_option("script_location", str(root / "alembic"))
                cfg.attributes["connection"] = sync
                command.upgrade(cfg, "head")
            await connection.run_sync(migrate)
        factory = async_sessionmaker(engine, expire_on_commit=False)
        monkeypatch.setattr(services, "AsyncSessionLocal", factory)
        monkeypatch.setattr(identity, "AsyncSessionLocal", factory)
        async with factory.begin() as session:
            session.add_all(User(id=uid, username=f"User{uid}", email=f"u{uid}@test.invalid", password_hash="test-only") for uid in (101, 102, 103))
        yield factory
    finally:
        async with engine.begin() as connection:
            await connection.execute(text(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE'))
        await engine.dispose()


def match():
    return dict(id=uuid4(), host_user_id=101, language_code="en", total_rounds=2, started_at=datetime.now(timezone.utc))


def completion(m=None, score=2, bluff=1, unlocked=None):
    m = m or match()
    return dict(game_id=m["id"], **{k: v for k, v in m.items() if k != "id"},
        player_results=[dict(user_id=uid, final_score=score if uid == 101 else 1, final_rank=rank,
                             bluff_votes_received=bluff if uid == 101 else 0) for rank, uid in enumerate((101, 102), 1)],
        category_results=[], unlocked=unlocked or {})


@pytest.mark.parametrize(("field", "threshold", "code"), [
    ("completed_games", 30, A.VETERAN), ("wins", 1, A.FIRST_VICTORY), ("wins", 10, A.CHAMPION),
    ("points", 100, A.MESSSSI), ("bluff_votes", 25, A.DECEPTION_MASTER)])
@pytest.mark.parametrize("offset", [-1, 0, 1])
def test_history_thresholds(field, threshold, code, offset):
    history = dict(completed_games=0, wins=0, points=0, bluff_votes=0)
    history[field] = threshold + offset
    assert (code in evaluate_historical_achievements(**history)) == (offset >= 0)


@pytest.mark.parametrize("count", [9, 10, 12])
def test_collector_counts_distinct_other_codes(count):
    codes = [code.value for code in A if code != A.COLLECTOR][:count]
    assert bool(evaluate_collector(codes + codes + [A.COLLECTOR.value])) == (count >= 10)


def test_real_receipts_are_idempotent_and_concurrent(monkeypatch):
    async def scenario():
        async with database(monkeypatch) as factory:
            m = match()
            args = dict(match=m, round_number=1, unlocked={101: [A.BLUFFER, A.PERFECT_TRAP]})
            receipts = await asyncio.gather(*(services.save_round_achievements(**args) for _ in range(6)))
            assert all(r == receipts[0] for r in receipts)
            async with factory() as session:
                assert (await session.get(Game, m["id"])).finished_at is None
                assert (await services.get_user_history(session, 101))["completed_games"] == 0
            finish = completion(m, unlocked={101: [A.ON_FIRE, A.REMONTADA_MASTER]})
            receipts = await asyncio.gather(*(services.save_game_results(**finish) for _ in range(6)))
            assert all(r == receipts[0] for r in receipts)
            assert receipts[0]["historical"] == {"101": ["FIRST_VICTORY"]}
            async with factory() as session:
                assert await session.scalar(select(func.count()).select_from(GamePlayerResult)) == 2
                assert await session.scalar(select(func.count()).select_from(GamePersistenceEvent)) == 2
                assert (await session.get(GamePlayerResult, (m["id"], 101))).final_score == 2
                owned = set((await session.scalars(select(UserAchievement.achievement_code).where(UserAchievement.user_id == 101))).all())
                assert owned == {"BLUFFER", "PERFECT_TRAP", "ON_FIRE", "REMONTADA_MASTER", "FIRST_VICTORY"}
            assert await services.save_unlocked_achievements({101: [A.BLUFFER, A.BLUFFER]}) == {}
            with pytest.raises(ValueError, match="different data"):
                await services.save_game_results(**{**finish, "player_results": [{**finish["player_results"][0], "final_score": 99}, finish["player_results"][1]]})
    asyncio.run(scenario())


@pytest.mark.parametrize("event_kind", ["round", "finish"])
def test_transaction_rollback_and_retry(monkeypatch, event_kind):
    async def scenario():
        async with database(monkeypatch) as factory:
            original = services._insert_achievements
            async def fail_after_insert(session, unlocked):
                await original(session, unlocked)
                raise RuntimeError("injected transaction failure")
            monkeypatch.setattr(services, "_insert_achievements", fail_after_insert)
            m = match()
            finish = completion(m, unlocked={101: [A.ON_FIRE]})
            async def save():
                if event_kind == "round":
                    return await services.save_round_achievements(match=m, round_number=1, unlocked={101: [A.BLUFFER]})
                return await services.save_game_results(**finish)
            with pytest.raises(RuntimeError, match="injected"):
                await save()
            async with factory() as session:
                for model in (Game, GamePlayerResult, UserAchievement, GamePersistenceEvent):
                    assert await session.scalar(select(func.count()).select_from(model)) == 0
            monkeypatch.setattr(services, "_insert_achievements", original)
            receipt = await save()
            assert set(receipt["newly_saved"]["101"]) == ({"BLUFFER"} if event_kind == "round" else {"FIRST_VICTORY", "ON_FIRE"})
            assert await save() == receipt
            async with factory() as session:
                assert (await services.get_user_history(session, 101))["completed_games"] == (0 if event_kind == "round" else 1)
    asyncio.run(scenario())


async def seed_history(factory, count, wins=0, points=0, bluff_votes=0):
    async with factory.begin() as session:
        for index in range(count):
            m = match()
            session.add(Game(**m, finished_at=datetime.now(timezone.utc)))
            await session.flush()
            session.add(GamePlayerResult(game_id=m["id"], user_id=101, final_rank=1 if index < wins else 2,
                final_score=points if index == 0 else 0, bluff_votes_received=bluff_votes if index == 0 else 0))


def test_all_awards_collector_and_user_isolation_are_persistent(monkeypatch):
    async def scenario():
        async with database(monkeypatch) as factory:
            await seed_history(factory, 29, wins=9, points=87, bluff_votes=24)
            await services.save_unlocked_achievements({101: [A.BLUFFER, A.LONE_GENIUS, A.PERFECT_TRAP, A.TRUTH_SEEKER, A.EINSTEIN]})
            receipt = await services.save_game_results(**completion(score=13, bluff=1, unlocked={101: [A.ON_FIRE, A.REMONTADA_MASTER]}))
            assert set(receipt["historical"]["101"]) == {"VETERAN", "FIRST_VICTORY", "CHAMPION", "MESSSSI", "DECEPTION_MASTER", "COLLECTOR"}
            new_room = Room(meta_data=RoomMetaData(host_id="101", settings=RoomSettings()))
            assert new_room.meta_data.match is None
            async with factory() as session:
                assert await services.get_user_history(session, 101) == dict(completed_games=30, wins=10, points=100, bluff_votes=25)
                assert await services.get_user_history(session, 102) == dict(completed_games=1, wins=0, points=1, bluff_votes=0)
                codes = set((await session.scalars(select(UserAchievement.achievement_code).where(UserAchievement.user_id == 101))).all())
                assert codes == {code.value for code in A}
                assert await session.scalar(select(func.count()).select_from(UserAchievement).where(UserAchievement.user_id == 102)) == 0
            assert (await services.save_game_results(**completion(score=10, bluff=4)))["historical"] == {}
    asyncio.run(scenario())


def test_first_victory_after_losses_and_concurrent_matches(monkeypatch):
    async def scenario():
        async with database(monkeypatch) as factory:
            await seed_history(factory, 3, points=90, bluff_votes=23)
            await services.save_round_achievements(match=match(), round_number=1, unlocked={})
            receipts = await asyncio.gather(services.save_game_results(**completion(score=6, bluff=1)), services.save_game_results(**completion(score=7, bluff=2)))
            all_new = [code for r in receipts for code in r["historical"].get("101", [])]
            for code in ("FIRST_VICTORY", "MESSSSI", "DECEPTION_MASTER"):
                assert all_new.count(code) == 1
            async with factory() as session:
                assert await services.get_user_history(session, 101) == dict(completed_games=5, wins=2, points=103, bluff_votes=26)
    asyncio.run(scenario())


def make_room():
    players = {}
    for uid in (101, 102, 103):
        ws = WebSocket({"type": "websocket"}, AsyncMock(), AsyncMock())
        ws.state.authenticated_user_id = uid
        players[str(uid)] = PlayerInfo(ws=ws, name=f"User{uid}", user_id=uid)
    return Room(meta_data=RoomMetaData(host_id="101", settings=RoomSettings(total_rounds=1)), players=players)


def vote_phase():
    phase = RoomPhase()
    phase.start()
    phase.cycle()
    phase.cycle()
    return phase


def choices():
    return [dict(id="correct", text="Truth", author_ids=[], is_correct=True),
            dict(id="bluff", text="Bluff", author_ids=["101"], is_correct=False),
            dict(id="decoy", text="Other", author_ids=[], is_correct=False)]


async def stop_timer(room):
    if room.meta_data.timer_task is not None:
        room.meta_data.timer_task.cancel()
        await asyncio.gather(room.meta_data.timer_task, return_exceptions=True)


@pytest.mark.parametrize("commit_before_error", [False, True], ids=["offline", "lost-commit-ack"])
def test_loop_failure_retry_shared_authors_and_new_match_reset(monkeypatch, commit_before_error):
    async def scenario():
        async with database(monkeypatch) as factory:
            monkeypatch.setattr(events, "load_categories", AsyncMock(return_value=[{"id": 1, "name": "Test"}]))
            room = make_room()
            manager = SimpleNamespace(rooms={"room": room}, broadcast=AsyncMock())
            context = Context(room_id="room", user_id="101", user_name="User101")
            await events.to_next_phase(manager, context)
            await stop_timer(room)
            first_id = room.meta_data.match["id"]
            room.meta_data.phase = vote_phase()
            room.meta_data.voting_choices = choices()
            room.meta_data.voting_choices[1]["author_ids"] = ["101", "102"]
            room.meta_data.voting_results = {"101": "correct", "103": "bluff"}
            room.meta_data.correct_answer_streaks["101"] = 4
            room.meta_data.correct_answer_totals["101"] = 9
            original = events.save_round_achievements
            async def fail_round(**kwargs):
                if commit_before_error:
                    await original(**kwargs)
                raise RuntimeError("connection lost")
            monkeypatch.setattr(events, "save_round_achievements", fail_round)
            broadcasts = manager.broadcast.await_count
            with pytest.raises(GameError, match="Round save failed"):
                await events.to_next_phase(manager, context)
            assert manager.broadcast.await_count == broadcasts
            assert [p.score for p in room.players.values()] == [3, 2, 0]
            assert [p.bluff_votes_received for p in room.players.values()] == [1, 1, 0]
            monkeypatch.setattr(events, "save_round_achievements", original)
            await asyncio.gather(events.retry_persistence(manager, context), events.reveal_results(manager, context))
            assert [p.score for p in room.players.values()] == [3, 2, 0]
            assert room.meta_data.current_round == 2
            original_finish = events.save_game_results
            async def fail_finish(**kwargs):
                if commit_before_error:
                    await original_finish(**kwargs)
                raise RuntimeError("connection lost")
            monkeypatch.setattr(events, "save_game_results", fail_finish)
            with pytest.raises(GameError, match="Match save failed"):
                await events.to_next_phase(manager, context)
            assert room.meta_data.phase.current_state == RoomPhase.PODIUM
            monkeypatch.setattr(events, "save_game_results", original_finish)
            await events.retry_persistence(manager, context)
            assert room.meta_data.phase.current_state == RoomPhase.LOBBY
            prior = room.meta_data.last_match_result
            async with factory() as session:
                result = await session.get(GamePlayerResult, (first_id, 102))
                assert (result.final_score, result.bluff_votes_received, result.final_rank) == (2, 1, 2)
                owned = set((await session.scalars(select(UserAchievement.achievement_code).where(UserAchievement.user_id == 101))).all())
                assert {"LONE_GENIUS", "PERFECT_TRAP", "TRUTH_SEEKER", "EINSTEIN", "ON_FIRE", "FIRST_VICTORY"} <= owned
            await events.to_next_phase(manager, context)
            await stop_timer(room)
            assert room.meta_data.match["id"] != first_id
            assert all(p.score == p.bluff_votes_received == 0 for p in room.players.values())
            assert room.meta_data.last_match_result == prior
    asyncio.run(scenario())


@pytest.mark.parametrize("rejoin", [False, True])
def test_completed_match_roster_includes_late_and_departed_once(monkeypatch, rejoin):
    async def scenario():
        async with database(monkeypatch) as factory:
            async with factory.begin() as session:
                session.add(User(id=104, username="Late", email="late@test.invalid", password_hash="test-only"))
            monkeypatch.setattr(events, "load_categories", AsyncMock(return_value=[{"id": 1, "name": "Test"}]))
            room = make_room()
            room.meta_data.settings.total_rounds = 2
            manager = SimpleNamespace(rooms={"room": room}, broadcast=AsyncMock())
            context = Context(room_id="room", user_id="101", user_name="User101")
            await events.to_next_phase(manager, context)
            await stop_timer(room)
            room.meta_data.phase = vote_phase()
            room.meta_data.voting_choices = choices()
            room.meta_data.voting_choices[1]["author_ids"] = ["102"]
            room.meta_data.voting_results = {"101": "bluff", "102": "correct", "103": "bluff"}
            await events.to_next_phase(manager, context)
            await events.to_next_phase(manager, context)
            assert room.players["102"].score == 5
            await room_manager.RoomManager.remove_connection(manager, "102", "room")
            for uid in ([104, 102] if rejoin else [104]):
                ws = WebSocket({"type": "websocket"}, AsyncMock(), AsyncMock())
                ws.state.authenticated_user_id = uid
                events.join_room(manager.rooms, ws, "room", str(uid), f"User{uid}")
                assert not room.players[str(uid)].on_fire_eligible
            if rejoin:
                assert room.players["102"].score == 5
                assert room.players["102"].bluff_votes_received == 2
            clear_data(room)
            room.meta_data.phase = vote_phase()
            room.meta_data.voting_choices = choices()
            room.meta_data.voting_results = {"101": "correct", "103": "bluff", "104": "bluff"}
            if rejoin:
                room.meta_data.voting_results["102"] = "bluff"
            await events.to_next_phase(manager, context)
            await events.to_next_phase(manager, context)
            assert room.meta_data.phase.current_state == RoomPhase.LOBBY
            async with factory() as session:
                rows = (await session.scalars(select(GamePlayerResult).where(GamePlayerResult.game_id == room.meta_data.match["id"]))).all()
                assert len(rows) == 4
                departed = next(row for row in rows if row.user_id == 102)
                assert departed.final_score == 5 and departed.final_rank > 1
                assert departed.bluff_votes_received == 2
                assert (await services.get_user_history(session, 104))["completed_games"] == 1
                assert (await services.get_user_history(session, 102))["wins"] == 0
    asyncio.run(scenario())


def test_identity_rejects_client_ids_and_unknown_users(monkeypatch):
    async def scenario():
        async with database(monkeypatch):
            for principal in (None, SimpleNamespace(is_authenticated=True, user_id="101"), SimpleNamespace(is_authenticated=True, user_id=999)):
                ws = WebSocket({"type": "websocket", "query_string": b"user_id=101", "user": principal}, AsyncMock(), AsyncMock())
                with pytest.raises(WebSocketException):
                    await identity.authenticated_player(ws)
            ws = WebSocket({"type": "websocket", "query_string": b"user_id=999", "user": SimpleNamespace(is_authenticated=True, user_id=101)}, AsyncMock(), AsyncMock())
            verified = await identity.authenticated_player(ws)
            assert (verified.user_id, verified.player_id, verified.username) == (101, "101", "User101")
    asyncio.run(scenario())


def test_tcp_commit_and_reread_after_tiebreak(monkeypatch):
    async def scenario():
        async with database(monkeypatch) as factory:
            await seed_history(factory, 1, points=95, bluff_votes=24)
            live = room_manager.RoomManager()
            monkeypatch.setattr(room_manager, "manager", live)
            monkeypatch.setattr(events, "load_categories", AsyncMock(return_value=[{"id": 1, "name": "Test"}]))
            tokens = {str(uuid4()): uid for uid in (101, 102, 103)}
            # Test-only stand-in for the absent external authentication middleware.
            async def authenticated_app(scope, receive, send):
                if scope["type"] == "websocket":
                    token = dict(scope.get("headers", [])).get(b"authorization", b"").decode()
                    if token in tokens:
                        scope["user"] = SimpleNamespace(is_authenticated=True, user_id=tokens[token])
                await app(scope, receive, send)
            async def receive(ws):
                return json.loads(await asyncio.wait_for(ws.recv(), 5))
            async with tcp_server(authenticated_app) as base:
                with pytest.raises(InvalidStatus):
                    async with connect(base + "/room/room?user_id=101&user_name=Imposter"):
                        pass
                async with AsyncExitStack() as stack:
                    clients = [await stack.enter_async_context(connect(base + "/room/room?user_id=999&user_name=Fake", additional_headers={"Authorization": token})) for token in tokens]
                    for ws, count in zip(clients, (3, 2, 1)):
                        for _ in range(count):
                            assert (await receive(ws))["event"] == "LOBBY_UPDATE"
                    room = live.rooms["room"]
                    assert set(room.players) == {"101", "102", "103"}
                    room.meta_data.settings.total_rounds = 1
                    await clients[0].send(json.dumps({"event": "NEXT_PHASE", "data": {}}))
                    for ws in clients:
                        assert (await receive(ws))["event"] == "PHASE_CATEGORY"
                    await stop_timer(room)
                    game_id = room.meta_data.match["id"]
                    for votes in (("correct", "correct", "decoy"), ("correct", "bluff", "bluff")):
                        clear_data(room)
                        room.meta_data.phase = vote_phase()
                        room.meta_data.voting_choices = choices()
                        for index, (ws, vote) in enumerate(zip(clients, votes)):
                            await ws.send(json.dumps({"event": "SUBMIT_VOTE", "data": {"choice_id": vote}}))
                            if index < 2:
                                assert (await receive(ws))["event"] == "VOTE_SUBMITTED"
                        for ws in clients:
                            result = await receive(ws)
                            assert result["event"] == "RESULTS_REVEALED"
                            assert result["data"]["persistence"]["status"] == "saved"
                        await clients[0].send(json.dumps({"event": "NEXT_PHASE", "data": {}}))
                        messages = [await receive(ws) for ws in clients]
                        assert all(m["event"] == "PHASE_PODIUM" for m in messages)
                        if votes[1] == "correct":
                            assert all(m["data"]["unlocked_achievements"] == {} for m in messages)
                            async with factory() as session:
                                assert (await session.get(Game, game_id)).finished_at is None
                                assert await session.get(GamePlayerResult, (game_id, 101)) is None
                    expected = {"ON_FIRE", "FIRST_VICTORY", "MESSSSI", "DECEPTION_MASTER"}
                    for message in messages:
                        assert set(message["data"]["unlocked_achievements"]["101"]) == expected
                        assert set(message["data"]["newly_saved_achievements"]["101"]) == expected
                    async with factory() as session:
                        row = await session.get(GamePlayerResult, (game_id, 101))
                        assert (row.final_score, row.final_rank, row.bluff_votes_received) == (6, 1, 2)
                        assert await services.get_user_history(session, 101) == dict(completed_games=2, wins=1, points=101, bluff_votes=26)
                        owned = set((await session.scalars(select(UserAchievement.achievement_code).where(UserAchievement.user_id == 101))).all())
                        assert expected | {"LONE_GENIUS", "PERFECT_TRAP"} == owned
    asyncio.run(scenario())
