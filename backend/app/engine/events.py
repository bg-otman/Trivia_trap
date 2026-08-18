from __future__ import annotations # to treat type hints as strings to avoid circular imports
from fastapi import WebSocket
from .room_models import PlayerInfo, RoomMetaData, RoomSettings, Room
from pydantic import Field
from typing import Annotated, TYPE_CHECKING
from dataProcessing.ingestion import get_categories, get_question # import demo functions until we have a proper data processing module

if TYPE_CHECKING: # it evaluates to False at runtime, so the import is only for type checking and avoids circular imports
    from .room_manager import RoomManager

def join_room(rooms: dict, ws: WebSocket, room_id: str, player_id: str, name: str):
    """
        Join or Create Room if it does not exist. If the room exists, add the player to the room. If the room is full, raise an error.
    """
    if rooms.get(room_id) is None:
        rooms[room_id] = Room(meta_data=RoomMetaData(host_id=player_id, settings=RoomSettings()), players={})
    room = rooms[room_id]
    if len(room.players) >= room.meta_data.settings.max_players:
        raise ValueError("FULL_ROOM")
    room.players[player_id] = PlayerInfo(ws=ws, name=name)


def start_game(manager: RoomManager, room_id: str, user_id: str, user_name: str, data: dict):
    """
        Start the game by changing the room phase to CATEGORY and broadcasting the event to all players in the room.
    """
    room = manager.rooms.get(room_id)
    if room is None:
        raise ValueError("ROOM_NOT_FOUND")
    if user_id != room.meta_data.host_id:
        raise ValueError("NOT_HOST")
    room.meta_data.phase.cycle() # Move to the next phase
    return { "event": "PHASE_CATEGORY", "data": { "categories": get_categories() } } # here i need to return category data

def choose_category(manager: RoomManager, room_id: str, user_id: str, user_name: str, data: dict):
    """
        Choose a category for the round and broadcast the event to all players in the room.
    """
    room = manager.rooms.get(room_id)
    if room is None:
        raise ValueError("ROOM_NOT_FOUND")
    category = data.get("category")
    if category is None:
        raise ValueError("INVALID_CATEGORY")
    question = get_question(category)
    return { 
        "event": "PHASE_QUESTION",
        "data": { 
            "category": category, 
            "question": question,
            "round": room.meta_data.current_round + 1,
            "total_rounds": room.meta_data.settings.total_rounds,
            "duration": room.meta_data.settings.bluff_time
            } 
        }

event_handlers = {
    "START_GAME" : start_game,
    "CHOOSE_CATEGORY" : choose_category,
    # "SUBMIT_ANSWER" : submit_answer,
    # "SUBMIT_BLUFF" : submit_bluff,
    # "SUBMIT_VOTE" : submit_vote,
    # "NEXT_ROUND" : next_round,
    # "LEAVE_ROOM" : leave_room,
    # "KICK_PLAYER" : kick_player,
    # "UPDATE_SETTINGS" : update_settings,
    # "CHAT_MESSAGE" : handle_chat_message,
}

def process_event(manager: RoomManager, room_id: str, user_id: str, user_name: str, event_name: str, data: dict
            ) -> Annotated[dict, Field(description="Response as JSON format containing event, data")]:
    """
        Process incoming events from the client and return a payload to broadcast to all players in the room.
    """
    if event_name not in event_handlers:
        raise ValueError("INVALID_EVENT")
    handler = event_handlers[event_name]
    response = handler(manager, room_id, user_id, user_name, data)
    return response

