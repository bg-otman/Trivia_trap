from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4
import asyncio
from starlette.websockets import WebSocket

from app.engine import events
from app.engine.room_models import PlayerInfo, Room, RoomMetaData, RoomSettings
from app.engine.utils import Context


def completed_room() -> Room:
    scope = {"type": "websocket", "path": "/", "headers": [], "query_string": b"", "scheme": "ws", "server": ("test", 80), "client": ("test", 1), "subprotocols": []}
    host_ws = WebSocket(scope, AsyncMock(), AsyncMock())
    guest_ws = WebSocket(scope, AsyncMock(), AsyncMock())
    metadata = RoomMetaData(host_id="host", settings=RoomSettings(total_rounds=1))
    metadata.phase.start()
    for _ in range(4):
        metadata.phase.cycle()
    metadata.current_round = 2
    metadata.game_id = uuid4()
    metadata.game_started_at = datetime.now(timezone.utc)
    metadata.podium = [
        {"player_id": "host", "username": "Host", "score": 5, "rank": 1},
        {"player_id": "guest", "username": "Guest", "score": 2, "rank": 2},
    ]
    metadata.bluff_votes_received = {"host": 2, "guest": 1}
    return Room(
        meta_data=metadata,
        players={
            "host": PlayerInfo(ws=host_ws, name="Host", db_user_id=10, score=5),
            "guest": PlayerInfo(ws=guest_ws, name="Guest", db_user_id=20, score=2),
        },
    )


def test_true_game_end_persists_authoritative_results_once(monkeypatch):
    room = completed_room()
    manager = SimpleNamespace(rooms={"ROOM": room}, broadcast=AsyncMock())
    save = AsyncMock(return_value=room.meta_data.game_id)
    monkeypatch.setattr(events, "save_game_results", save)
    monkeypatch.setattr(events, "save_achievement_candidates", AsyncMock(return_value={}))

    context = Context(room_id="ROOM", user_id="host", user_name="Host", data={})
    asyncio.run(events.podium(manager, context))
    room.meta_data.phase.start()
    for _ in range(4):
        room.meta_data.phase.cycle()
    asyncio.run(events.podium(manager, context))

    save.assert_awaited_once()
    call = save.await_args.kwargs
    assert call["game_id"] == room.meta_data.game_id
    assert call["total_rounds"] == 1
    assert call["player_results"] == [
        {"user_id": 10, "final_score": 5, "final_rank": 1, "bluff_votes_received": 2},
        {"user_id": 20, "final_score": 2, "final_rank": 2, "bluff_votes_received": 1},
    ]
    assert room.meta_data.game_results_saved is True


def test_persistence_failure_does_not_block_podium_broadcast(monkeypatch):
    room = completed_room()
    manager = SimpleNamespace(rooms={"ROOM": room}, broadcast=AsyncMock())
    monkeypatch.setattr(events, "save_game_results", AsyncMock(side_effect=RuntimeError("database unavailable")))
    monkeypatch.setattr(events, "save_achievement_candidates", AsyncMock(return_value={}))

    asyncio.run(events.podium(manager, Context(room_id="ROOM", user_id="host", user_name="Host", data={})))

    manager.broadcast.assert_awaited_once()
    payload = manager.broadcast.await_args.args[0]
    assert payload["event"] == "PHASE_PODIUM"
    assert payload["data"]["game_finished"] is True
    assert room.meta_data.game_results_saved is False
    assert room.meta_data.game_results_saving is False


def test_new_room_has_no_completed_match_identity():
    metadata = RoomMetaData(host_id="host", settings=RoomSettings())
    assert metadata.game_id is None
    assert metadata.game_started_at is None
    assert metadata.game_results_saved is False
