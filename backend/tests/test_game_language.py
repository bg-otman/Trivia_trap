import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from pydantic import ValidationError

from app.engine.events import update_settings
from app.engine.room_models import Room, RoomMetaData, RoomPhase, RoomSettings
from app.engine.utils import Context, GameError, validate_phase


def settings_payload(language: str) -> dict:
    return {
        "total_rounds": 5,
        "bluff_time": 20,
        "vote_time": 15,
        "max_players": 10,
        "language": language,
    }


def test_room_language_defaults_to_english_and_accepts_arabic() -> None:
    assert RoomSettings().language == "en"
    assert RoomSettings(**settings_payload("ar")).language == "ar"


def test_room_language_rejects_unsupported_values() -> None:
    with pytest.raises(ValidationError):
        RoomSettings(**settings_payload("fr"))


def test_host_language_update_is_saved_and_broadcast() -> None:
    room = Room(meta_data=RoomMetaData(host_id="host", settings=RoomSettings()))
    manager = SimpleNamespace(rooms={"ROOM": room}, broadcast=AsyncMock())
    context = Context(
        room_id="ROOM",
        user_id="host",
        user_name="Host",
        data=settings_payload("ar"),
    )

    asyncio.run(update_settings(manager, context))

    assert room.meta_data.settings.language == "ar"
    payload = manager.broadcast.await_args.args[0]
    assert payload["event"] == "LOBBY_UPDATE"
    assert payload["data"]["settings"]["language"] == "ar"


def test_non_host_cannot_update_language() -> None:
    room = Room(meta_data=RoomMetaData(host_id="host", settings=RoomSettings()))
    manager = SimpleNamespace(rooms={"ROOM": room}, broadcast=AsyncMock())
    context = Context(
        room_id="ROOM",
        user_id="guest",
        user_name="Guest",
        data=settings_payload("ar"),
    )

    with pytest.raises(GameError, match="Only the host"):
        asyncio.run(update_settings(manager, context))
    assert room.meta_data.settings.language == "en"
    manager.broadcast.assert_not_awaited()


def test_settings_are_locked_after_game_start() -> None:
    with pytest.raises(GameError, match="already started"):
        validate_phase(RoomPhase.CATEGORY, "UPDATE_SETTINGS")

