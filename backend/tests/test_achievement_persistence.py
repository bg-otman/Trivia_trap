import asyncio
import importlib
from pathlib import Path
from uuid import uuid4

import asyncpg
import pytest
from alembic import command
from alembic.config import Config
from fastapi import WebSocket
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from dataProcessing import achievement_persistence as storage
from dataProcessing.database import DATABASE_URL, get_db
from dataProcessing.models import User, UserAchievement
from engine import events
from engine.room_models import PlayerInfo, Room, RoomMetaData, RoomSettings
from engine.utils import Context, clear_data
from users.utils import get_user_achievements


@pytest.fixture(scope="module")
def isolated_database_url():
    """Migrate a disposable database; never run writes against trivia_db."""
    name = f"trivia_achievement_test_{uuid4().hex}"
    base = make_url(DATABASE_URL)
    admin_dsn = base.set(drivername="postgresql", database="postgres").render_as_string(hide_password=False)
    test_url = base.set(database=name).render_as_string(hide_password=False)

    async def admin_command(sql):
        connection = await asyncpg.connect(admin_dsn)
        try:
            await connection.execute(sql)
        finally:
            await connection.close()

    asyncio.run(admin_command(f'CREATE DATABASE "{name}"'))
    try:
        config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
        config.set_main_option("sqlalchemy.url", test_url)
        command.upgrade(config, "head")
        yield test_url
    finally:
        asyncio.run(admin_command(f'DROP DATABASE "{name}" WITH (FORCE)'))


def run_in_database(url, monkeypatch, scenario):
    async def run():
        engine = create_async_engine(url)
        maker = async_sessionmaker(engine, expire_on_commit=False)
        monkeypatch.setattr(storage, "AsyncSessionLocal", maker)
        try:
            await scenario(maker)
        finally:
            await engine.dispose()

    asyncio.run(run())


async def make_users(maker, count):
    async with maker.begin() as session:
        users = [User(username=f"ach{uuid4().hex[:10]}", email=f"ach_{uuid4().hex}@example.test", password_hash="test") for _ in range(count)]
        session.add_all(users)
        await session.flush()
        return [user.id for user in users]


def make_room(user_ids):
    async def receive():
        return {"type": "websocket.receive"}

    async def send(_message):
        pass

    players = {
        str(user_id): PlayerInfo(
            ws=WebSocket({"type": "websocket"}, receive, send),
            name=f"player{index}", db_user_id=user_id,
        )
        for index, user_id in enumerate(user_ids)
    }
    return Room(meta_data=RoomMetaData(host_id=str(user_ids[0]), settings=RoomSettings()), players=players)


class FakeManager:
    def __init__(self, room):
        self.rooms = {"room": room}
        self.broadcasts = []

    async def broadcast(self, payload, _room_id, _exclude):
        self.broadcasts.append(payload)


def set_round(room, user_ids):
    first, second, third = map(str, user_ids)
    room.meta_data.voting_choices = [
        {"id": "correct", "text": "answer", "author_ids": [], "is_correct": True},
        {"id": "bluff", "text": "fake", "author_ids": [first], "is_correct": False},
    ]
    room.meta_data.voting_results = {first: "correct", second: "bluff", third: "bluff"}


def test_postgres_save_load_duplicate_and_profile(isolated_database_url, monkeypatch):
    async def scenario(maker):
        first, second, empty = await make_users(maker, 3)
        assert await storage.load_unlocked_achievements({first, second, empty}) == {
            first: set(), second: set(), empty: set(),
        }
        async with maker.begin() as session:
            session.add(UserAchievement(
                user_id=first, achievement_code="SHARP_EYE", description="locked",
                img="/achievements/sharp_eye.png", unlocked=False,
            ))
        assert (await storage.load_unlocked_achievements({first}))[first] == set()

        codes = list(storage.ACHIEVEMENT_DEFINITIONS)
        saved = await storage.save_unlocked_achievements({first: codes, second: ["FIRST_CORRECT"]})
        assert set(saved[first]) == set(codes)
        assert saved[second] == ["FIRST_CORRECT"]
        assert await storage.save_unlocked_achievements({first: codes, second: ["FIRST_CORRECT"]}) == {}

        async with maker() as reopened:
            rows = (await reopened.execute(select(UserAchievement).where(UserAchievement.user_id == first))).scalars().all()
            assert len(rows) == 7
            for row in rows:
                description, img = storage.ACHIEVEMENT_DEFINITIONS[row.achievement_code]
                assert (row.description, row.img, row.unlocked) == (description, img, True)
            assert await reopened.scalar(select(func.count()).select_from(UserAchievement).where(
                UserAchievement.achievement_code == "FIRST_CORRECT")) == 2
            profile = await get_user_achievements(reopened, first)
            assert {entry.name for entry in profile} == set(codes)
            assert all(entry.unlocked and entry.img.startswith("/achievements/") for entry in profile)

        assert await storage.load_unlocked_achievements({first, second, empty}) == {
            first: set(codes), second: {"FIRST_CORRECT"}, empty: set(),
        }

    run_in_database(isolated_database_url, monkeypatch, scenario)


def test_round_unlock_and_new_room_reload(isolated_database_url, monkeypatch):
    async def scenario(maker):
        ids = await make_users(maker, 3)
        first = str(ids[0])
        context = Context(room_id="room", user_id=first, user_name="player0")
        room = make_room(ids)
        manager = FakeManager(room)
        persisted_ids = []
        original_persist = events.persist_new_achievements

        async def record_persist(unlocks, player_user_ids):
            persisted_ids.append(player_user_ids.copy())
            return await original_persist(unlocks, player_user_ids)

        monkeypatch.setattr(events, "persist_new_achievements", record_persist)
        set_round(room, ids)
        await events.reveal_results(manager, context)
        assert context.user_id == first and type(context.user_id) is str
        assert type(persisted_ids[0][first]) is int
        assert persisted_ids[0][first] == ids[0]
        assert set(manager.broadcasts[-1]["data"]["achievements"][first]) == {
            "FIRST_CORRECT", "FIRST_BLUFF", "PERFECT_BLUFF",
        }
        assert (await storage.load_unlocked_achievements({ids[0]}))[ids[0]] == {
            "FIRST_CORRECT", "FIRST_BLUFF", "PERFECT_BLUFF",
        }
        assert (await storage.save_unlocked_achievements({ids[0]: ["SHARP_EYE"]}))[ids[0]] == ["SHARP_EYE"]
        clear_data(room)
        set_round(room, ids)
        await events.reveal_results(manager, context)
        assert manager.broadcasts[-1]["data"]["achievements"] == {}

        restarted = make_room(ids)
        assert restarted.meta_data.achievement_state == {"correct_answers": {}, "unlocked": {}}
        restarted_manager = FakeManager(restarted)

        async def categories(_language):
            return [{"id": 1, "name": "General"}]

        monkeypatch.setattr(events, "load_categories", categories)
        await events.to_next_phase(restarted_manager, context)
        restarted.meta_data.timer_task.cancel()
        assert restarted.meta_data.achievement_state["correct_answers"] == {}
        assert restarted.meta_data.achievement_state["unlocked"][first] == {
            "FIRST_CORRECT", "FIRST_BLUFF", "PERFECT_BLUFF", "SHARP_EYE",
        }
        set_round(restarted, ids)
        await events.reveal_results(restarted_manager, context)
        assert restarted_manager.broadcasts[-1]["data"]["achievements"] == {}
        for _ in range(4):
            clear_data(restarted)
            set_round(restarted, ids)
            await events.reveal_results(restarted_manager, context)
            assert "SHARP_EYE" not in restarted_manager.broadcasts[-1]["data"]["achievements"].get(first, [])

    run_in_database(isolated_database_url, monkeypatch, scenario)


def test_four_player_round_persists_round_star_and_perfect_round(isolated_database_url, monkeypatch):
    async def scenario(maker):
        ids = await make_users(maker, 4)
        first = str(ids[0])
        room = make_room(ids)
        manager = FakeManager(room)
        context = Context(room_id="room", user_id=first, user_name="player0")
        room.meta_data.voting_choices = [
            {"id": "correct", "text": "answer", "author_ids": [], "is_correct": True},
            {"id": "bluff", "text": "fake", "author_ids": [first], "is_correct": False},
        ]
        room.meta_data.voting_results = {
            first: "correct",
            **{str(user_id): "bluff" for user_id in ids[1:]},
        }

        await events.reveal_results(manager, context)
        expected = {
            "FIRST_CORRECT", "FIRST_BLUFF", "ROUND_STAR", "PERFECT_ROUND", "PERFECT_BLUFF",
        }
        assert set(manager.broadcasts[-1]["data"]["achievements"][first]) == expected
        assert room.players[first].score == 7
        assert (await storage.load_unlocked_achievements({ids[0]}))[ids[0]] == expected
        async with maker() as session:
            rows = (await session.execute(select(UserAchievement).where(
                UserAchievement.user_id == ids[0],
            ))).scalars().all()
            assert {row.achievement_code for row in rows} == expected
            assert all(row.unlocked for row in rows)

    run_in_database(isolated_database_url, monkeypatch, scenario)


def test_same_room_new_game_reloads_first_correct(isolated_database_url, monkeypatch):
    async def scenario(maker):
        ids = await make_users(maker, 3)
        first = str(ids[0])
        context = Context(room_id="room", user_id=first, user_name="player0")
        room = make_room(ids)
        manager = FakeManager(room)

        async def categories(_language):
            return [{"id": 1, "name": "General"}]

        monkeypatch.setattr(events, "load_categories", categories)
        await events.to_next_phase(manager, context)
        room.meta_data.timer_task.cancel()
        for _ in range(3):
            room.meta_data.phase.cycle()
        set_round(room, ids)
        await events.reveal_results(manager, context)
        assert "FIRST_CORRECT" in manager.broadcasts[-1]["data"]["achievements"][first]
        assert (await storage.load_unlocked_achievements({ids[0]}))[ids[0]] >= {"FIRST_CORRECT"}

        room.meta_data.phase.cycle()
        await events.return_to_lobby(manager, context)
        await events.to_next_phase(manager, context)
        room.meta_data.timer_task.cancel()
        assert room.meta_data.achievement_state["unlocked"][first] >= {"FIRST_CORRECT"}
        assert room.meta_data.achievement_state["correct_answers"] == {}
        for _ in range(3):
            room.meta_data.phase.cycle()
        set_round(room, ids)
        await events.reveal_results(manager, context)
        assert "FIRST_CORRECT" not in manager.broadcasts[-1]["data"]["achievements"].get(first, [])
        assert room.players[first].score == 5
        async with maker() as session:
            assert await session.scalar(select(func.count()).select_from(UserAchievement).where(
                UserAchievement.user_id == ids[0],
                UserAchievement.achievement_code == "FIRST_CORRECT",
            )) == 1

    run_in_database(isolated_database_url, monkeypatch, scenario)


def test_sharp_eye_partial_progress_resets_and_unlock_persists(isolated_database_url, monkeypatch):
    async def scenario(maker):
        ids = await make_users(maker, 3)
        first = str(ids[0])
        context = Context(room_id="room", user_id=first, user_name="player0")
        room = make_room(ids)
        manager = FakeManager(room)

        async def categories(_language):
            return [{"id": 1, "name": "General"}]

        monkeypatch.setattr(events, "load_categories", categories)

        async def start_game():
            await events.to_next_phase(manager, context)
            room.meta_data.timer_task.cancel()

        async def correct_round():
            for _ in range(3):
                room.meta_data.phase.cycle()
            set_round(room, ids)
            await events.reveal_results(manager, context)
            room.meta_data.phase.cycle()
            return manager.broadcasts[-1]["data"]["achievements"].get(first, [])

        await start_game()
        for round_number in range(1, 5):
            assert "SHARP_EYE" not in await correct_round()
            assert room.meta_data.achievement_state["correct_answers"][first] == round_number
            if round_number < 4:
                clear_data(room)
                room.meta_data.phase.cycle()
        assert "SHARP_EYE" not in (await storage.load_unlocked_achievements({ids[0]}))[ids[0]]
        async with maker() as session:
            assert await session.scalar(select(func.count()).select_from(UserAchievement).where(
                UserAchievement.user_id == ids[0],
                UserAchievement.achievement_code == "SHARP_EYE",
            )) == 0

        await events.return_to_lobby(manager, context)
        await start_game()
        assert room.meta_data.achievement_state["correct_answers"] == {}
        for round_number in range(1, 6):
            announced = await correct_round()
            assert ("SHARP_EYE" in announced) is (round_number == 5)
            if round_number < 5:
                clear_data(room)
                room.meta_data.phase.cycle()
        assert "SHARP_EYE" in (await storage.load_unlocked_achievements({ids[0]}))[ids[0]]

        await events.return_to_lobby(manager, context)
        await start_game()
        assert "SHARP_EYE" in room.meta_data.achievement_state["unlocked"][first]
        assert room.meta_data.achievement_state["correct_answers"] == {}
        assert "SHARP_EYE" not in await correct_round()
        async with maker() as session:
            assert await session.scalar(select(func.count()).select_from(UserAchievement).where(
                UserAchievement.user_id == ids[0],
                UserAchievement.achievement_code == "SHARP_EYE",
            )) == 1

    run_in_database(isolated_database_url, monkeypatch, scenario)


def test_high_scorer_tie_and_save_failure(isolated_database_url, monkeypatch):
    async def scenario(maker):
        ids = await make_users(maker, 3)
        first = str(ids[0])
        context = Context(room_id="room", user_id=first, user_name="player0")
        room = make_room(ids)
        manager = FakeManager(room)
        room.meta_data.phase.start()
        for _ in range(4):
            room.meta_data.phase.cycle()
        room.meta_data.current_round = room.meta_data.settings.total_rounds + 1
        room.meta_data.podium = [
            {"player_id": str(ids[0]), "score": 20},
            {"player_id": str(ids[1]), "score": 20},
            {"player_id": str(ids[2]), "score": 1},
        ]
        await events.podium(manager, context)
        assert manager.broadcasts[-1]["data"]["achievements"] == {}
        assert manager.broadcasts[-1]["data"]["game_finished"] is False
        assert (await storage.load_unlocked_achievements(set(ids)))[ids[0]] == set()
        room.meta_data.podium[0]["score"] = 21
        await events.podium(manager, context)
        assert manager.broadcasts[-1]["data"]["achievements"] == {
            str(ids[0]): ["HIGH_SCORER"], str(ids[1]): ["HIGH_SCORER"],
        }
        assert manager.broadcasts[-1]["data"]["game_finished"] is True
        assert (await storage.load_unlocked_achievements(set(ids)))[ids[0]] == {"HIGH_SCORER"}

        async def categories(_language):
            return [{"id": 1, "name": "General"}]

        monkeypatch.setattr(events, "load_categories", categories)
        await events.to_next_phase(manager, context)
        room.meta_data.timer_task.cancel()
        assert room.meta_data.achievement_state["unlocked"][first] == {"HIGH_SCORER"}
        for _ in range(4):
            room.meta_data.phase.cycle()
        room.meta_data.current_round = room.meta_data.settings.total_rounds + 1
        room.meta_data.podium = [
            {"player_id": str(ids[0]), "score": 21},
            {"player_id": str(ids[1]), "score": 20},
            {"player_id": str(ids[2]), "score": 1},
        ]
        await events.podium(manager, context)
        assert manager.broadcasts[-1]["data"]["game_finished"] is True
        assert manager.broadcasts[-1]["data"]["achievements"] == {}
        async with maker() as session:
            assert await session.scalar(select(func.count()).select_from(UserAchievement).where(
                UserAchievement.user_id == ids[0],
                UserAchievement.achievement_code == "HIGH_SCORER",
            )) == 1

        failing_room = make_room(ids)
        failing_room.meta_data.achievement_state["unlocked"][first] = {"HIGH_SCORER"}
        failing_manager = FakeManager(failing_room)
        set_round(failing_room, ids)
        original = events.persist_new_achievements

        async def fail(_unlocks, _ids):
            raise RuntimeError("database unavailable")

        monkeypatch.setattr(events, "persist_new_achievements", fail)
        await events.reveal_results(failing_manager, context)
        assert failing_manager.broadcasts[-1]["data"]["achievements"] == {}
        assert failing_room.meta_data.achievement_state["unlocked"] == {first: {"HIGH_SCORER"}}
        assert failing_room.meta_data.achievement_state["correct_answers"][first] == 1
        assert failing_room.players[first].score == 5
        assert failing_room.meta_data.current_round == 2
        assert "FIRST_CORRECT" not in (await storage.load_unlocked_achievements({ids[0]}))[ids[0]]
        monkeypatch.setattr(events, "persist_new_achievements", original)
        clear_data(failing_room)
        set_round(failing_room, ids)
        await events.reveal_results(failing_manager, context)
        assert "FIRST_CORRECT" in failing_manager.broadcasts[-1]["data"]["achievements"][first]

    run_in_database(isolated_database_url, monkeypatch, scenario)


def test_authenticated_websocket_identity_and_reconnect(isolated_database_url, monkeypatch):
    monkeypatch.setenv("JWT_SECRET_KEY", "achievement-test-only-secret")
    security = importlib.import_module("authentication.security")
    cookie = importlib.import_module("authentication.session_cookie")
    room_manager = importlib.import_module("engine.room_manager")
    app = importlib.import_module("main").app

    engine = create_async_engine(isolated_database_url, poolclass=NullPool)
    maker = async_sessionmaker(engine, expire_on_commit=False)
    first, second = asyncio.run(make_users(maker, 2))

    async def test_db():
        async with maker() as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    room_manager.manager.rooms.clear()
    try:
        with TestClient(app) as client:
            client.cookies.set(cookie.COOKIE_NAME, security.create_access_token(first, 0))
            with client.websocket_connect("/room/ROOM") as first_socket:
                first_lobby = first_socket.receive_json()
                assert first_lobby["data"]["players"][0]["player_id"] == str(first)
                assert room_manager.manager.rooms["ROOM"].players[str(first)].db_user_id == first

                client.cookies.set(cookie.COOKIE_NAME, security.create_access_token(second, 0))
                with client.websocket_connect("/room/ROOM") as second_socket:
                    assert second_socket.receive_json()["event"] == "LOBBY_UPDATE"
                    assert first_socket.receive_json()["event"] == "LOBBY_UPDATE"
                    room_manager.manager.rooms["ROOM"].meta_data.phase_payload = {
                        "event": "PHASE_CATEGORY", "data": {"round": 1, "duration": 15},
                    }
                    first_socket.close()
                    client.cookies.set(cookie.COOKIE_NAME, security.create_access_token(first, 0))
                    with client.websocket_connect("/room/ROOM") as reconnected:
                        assert reconnected.receive_json()["event"] == "LOBBY_UPDATE"
                        assert reconnected.receive_json()["event"] == "PHASE_CATEGORY"
                        assert room_manager.manager.rooms["ROOM"].players[str(first)].db_user_id == first
    finally:
        app.dependency_overrides.pop(get_db, None)
        room_manager.manager.rooms.clear()
        asyncio.run(engine.dispose())
