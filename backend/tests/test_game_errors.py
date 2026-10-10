import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from starlette.websockets import WebSocket

from app.engine.events import join_room, to_next_phase
from app.engine.room_manager import send_initial_game_error
from app.engine.room_models import PlayerInfo, Room, RoomMetaData, RoomPhase, RoomSettings
from app.engine.utils import Context, GameError


def websocket() -> WebSocket:
    scope = {
        "type": "websocket",
        "path": "/",
        "headers": [],
        "query_string": b"",
        "scheme": "ws",
        "server": ("test", 80),
        "client": ("test", 1),
        "subprotocols": [],
    }
    return WebSocket(scope, AsyncMock(), AsyncMock())


def player(name: str, user_id: int) -> PlayerInfo:
    return PlayerInfo(ws=websocket(), name=name, db_user_id=user_id)


def test_joining_nonexistent_room_returns_structured_game_error() -> None:
    with pytest.raises(GameError) as captured:
        join_room({}, websocket(), "ABC123", "7", "Guest", 7)

    assert captured.value.to_dict() == {
        "event": "ERROR",
        "data": {
            "code": "ROOM_NOT_FOUND",
            "message": "This room could not be found. Check the room code and try again.",
        },
    }


def test_joining_with_invalid_room_code_returns_validation_error() -> None:
    with pytest.raises(GameError) as captured:
        join_room({}, websocket(), "BAD!", "7", "Guest", 7)

    assert captured.value.error_code == "INVALID_ROOM_CODE"
    assert captured.value.message == "The room code is invalid. Please check it and try again."


def test_joining_full_room_returns_actionable_error() -> None:
    room = Room(
        meta_data=RoomMetaData(
            host_id="1",
            settings=RoomSettings(max_players=2),
        ),
        players={"1": player("Host", 1), "2": player("Player", 2)},
    )

    with pytest.raises(GameError, match="This room is full") as captured:
        join_room({"ROOM01": room}, websocket(), "ROOM01", "3", "Guest", 3)

    assert captured.value.error_code == "FULL_ROOM"


def test_joining_started_game_returns_actionable_error() -> None:
    metadata = RoomMetaData(host_id="1", settings=RoomSettings())
    metadata.phase.start()
    room = Room(meta_data=metadata, players={"1": player("Host", 1)})

    with pytest.raises(GameError, match="already in progress") as captured:
        join_room({"ROOM01": room}, websocket(), "ROOM01", "2", "Guest", 2)

    assert captured.value.error_code == "GAME_IN_PROGRESS"


def test_starting_game_requires_two_connected_players() -> None:
    disconnected_player = player("Player", 2)
    disconnected_player.is_present = False
    room = Room(
        meta_data=RoomMetaData(host_id="1", settings=RoomSettings()),
        players={"1": player("Host", 1), "2": disconnected_player},
    )
    manager = SimpleNamespace(rooms={"ROOM01": room})
    context = Context(room_id="ROOM01", user_id="1", user_name="Host")

    with pytest.raises(GameError, match="At least 2 connected players") as captured:
        asyncio.run(to_next_phase(manager, context))

    assert captured.value.error_code == "NOT_ENOUGH_PLAYERS"
    assert room.meta_data.phase.current_state == RoomPhase.LOBBY


def test_initial_game_error_is_sent_directly_then_closed() -> None:
    ws = SimpleNamespace(send_json=AsyncMock(), close=AsyncMock())
    error = GameError(
        "GAME_IN_PROGRESS",
        "This game is already in progress. You cannot join right now.",
    )

    asyncio.run(send_initial_game_error(ws, error))

    ws.send_json.assert_awaited_once_with(error.to_dict())
    ws.close.assert_awaited_once_with(code=1008, reason=error.message)

