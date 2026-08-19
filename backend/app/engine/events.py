from __future__ import annotations # to treat type hints as strings to avoid circular imports
from fastapi import WebSocket
from .room_models import PlayerInfo, RoomMetaData, RoomSettings, Room
from pydantic import Field
from typing import Annotated, TYPE_CHECKING
from dataProcessing.ingestion import ( get_category_list, get_random_question, 
           validate_bluff_answer, build_voting_choices, calculate_results ) # import demo functions until we have a proper data processing module
from .utils import GameError, Context
import asyncio

if TYPE_CHECKING: # it evaluates to False at runtime, so the import is only for type checking and avoids circular imports
    from .room_manager import RoomManager

def join_room(rooms: dict, ws: WebSocket, room_id: str, player_id: str, name: str):
    """
        Join or Create Room if it does not exist. If the room exists, add the player to the room. If the room is full, raise an error.
    """
    if rooms.get(room_id) is None:
        rooms[room_id] = Room(meta_data=RoomMetaData(host_id=player_id, settings=RoomSettings()), players={})
    room = rooms[room_id]
    if  player_id not in room.players and len(room.players) >= room.meta_data.settings.max_players:
        raise GameError("FULL_ROOM", "Room is full")
    if player_id not in room.players:
        room.players[player_id] = PlayerInfo(ws=ws, name=name)
    else:
        room.players[player_id].ws = ws
        room.players[player_id].is_present = True


def get_categories(manager: RoomManager, context: Context) -> dict:
    return {
        "event": "PHASE_CATEGORY",
        "data": {
            "categories": get_category_list() 
            } 
        }

def get_question(manager: RoomManager, context: Context) -> dict:
    """
        get a question from the selected category.
    """
    room = manager.rooms.get(context.room_id)
    category = context.data.get("category")
    if category is None:
        raise GameError("INVALID_CATEGORY", "Invalid category")
    question = get_random_question(category)
    room.meta_data.active_question = question.get("question")
    room.meta_data.correct_answer = question.get("correct_answer")
    room.meta_data.fake_answers = question.get("fake_answers", [])
    return { 
        "event": "PHASE_QUESTION",
        "data": { 
            "category": category, 
            "question": question.get("question"),
            "round": room.meta_data.current_round,
            "total_rounds": room.meta_data.settings.total_rounds,
            "duration": room.meta_data.settings.bluff_time
            } 
        }

def get_vote_choices(manager: RoomManager, context: Context) -> dict:
    """
        get the vote list for the current question. This includes the correct answer and all bluff answers submitted by players.
    """
    room = manager.rooms.get(context.room_id)
    return { 
        "event": "PHASE_VOTING",
        "data": { 
            "round": room.meta_data.current_round,
            "total_rounds": room.meta_data.settings.total_rounds,
            "duration": room.meta_data.settings.vote_time,
            "choices": build_voting_choices(room.meta_data.sumbitted_bluffs, room.meta_data.correct_answer, room.meta_data.fake_answers)
            } 
        }

def submit_bluff(manager: RoomManager, context: Context) -> dict:
    room = manager.rooms.get(context.room_id)
    bluff_answer = context.data.get("bluff_answer")
    if bluff_answer is None:
        raise GameError("INVALID_PAYLOAD", "Missing bluff answer in request")
    validate_bluff = validate_bluff_answer(bluff_answer)
    if not validate_bluff.get("is_valid"):
        raise GameError("BLUFF_REJECTED", validate_bluff.get("reason", "EXACT_TRUTH"))
    room.meta_data.sumbitted_bluffs[context.user_id] = bluff_answer
    return {
        "event": "BLUFF_SUBMITTED",
        "data": {
            "player_id": context.user_id,
        }
    }

def submit_vote(manager: RoomManager, context: Context) -> dict:
    room = manager.rooms.get(context.room_id)
    vote_choice = context.data.get("choice_id")
    if vote_choice is None:
        raise GameError("INVALID_PAYLOAD", "Missing vote choice in request")
    room.meta_data.voting_results[context.user_id] = vote_choice
    return {
        "event": "VOTE_SUBMITTED",
        "data": {
            "player_id": context.user_id,
        }
    }

def reveal_results(manager: RoomManager, context: Context) -> dict:
    """
        Reveal the results of the round, including the correct answer, votes, and updated scores.
    """
    room = manager.rooms.get(context.room_id)
    results = calculate_results(room.meta_data.voting_results, room.meta_data.sumbitted_bluffs, room.meta_data.correct_answer, room.players)
    room.meta_data.podium = results.get("leaderboard", [])
    return {
        "event": "RESULTS_REVEALED",
        "data": {
            results
        }
    }

def podium(manager: RoomManager, context: Context) -> dict:
    """
        Leaderboard for the current round. This includes the players and their scores for the current round.
    """
    room = manager.rooms.get(context.room_id)
    return {
        "event": "PHASE_PODIUM",
        "data": {
            "winners": room.meta_data.podium
        }
    }

def start_game(manager: RoomManager, context: Context) -> dict:
    """
        Start the game by changing the room phase to CATEGORY and broadcasting the event to all players in the room.
    """
    room = manager.rooms.get(context.room_id)
    if context.user_id != room.meta_data.host_id:
        raise GameError("FORBIDDEN", "Only the host can start the game")
    if room.meta_data.phase.current_state != room.meta_data.phase.LOBBY:
        raise GameError("INVALID_PHASE", "Game has already started")
    room.meta_data.phase.start()
    return get_categories(manager, context)

event_handlers = {
    "START_GAME" : start_game,
    "GET_QUESTION" : get_question,
    "SUBMIT_BLUFF" : submit_bluff,
    "SUBMIT_VOTE" : submit_vote,
    # "NEXT_ROUND" : next_round,
    # "LEAVE_ROOM" : leave_room,
    # "KICK_PLAYER" : kick_player,
    # "UPDATE_SETTINGS" : update_settings,
    # "CHAT_MESSAGE" : handle_chat_message,
}

# this games phases defined here to help with the state transition and scheduling the next phase.
game_phases = {
    "CATEGORY" : get_categories,
    "QUESTION" : get_question,
    "VOTE" : get_vote_choices,
    "REVEAL" : reveal_results,
    "PODIUM" : podium,
}

# transitionStates in the game are as follows:
# CHOOSE_CATEGORY (Timer) -> QUESTION (Timer) -> BLUFF (Timer) -> VOTE (Timer) -> REVEAL (Host trigger next round) -> 
# PODIUM (Host trigger next round) -> if round < total_rounds then CHOOSE_CATEGORY else LOBBY
# For the timer, we can use asyncio.sleep() to wait for the duration of the phase and then transition to the next phase.
# and take in consideration to cancel the timer if all players have submitted their answers/bluffs/votes before the timer ends.
# async def scheduleStateTransition(manager: RoomManager, room_id: str, delay: int, next_phase_event: str):
#     """
#         Schedule a state transition after a delay and broadcast the next phase event to all players in the room.
#     """
#     await asyncio.sleep(delay)
#     room = manager.rooms.get(room_id)
#     if room is None:
#         raise GameError("ROOM_NOT_FOUND", "Room not found")
    

def process_event(manager: RoomManager, room_id: str, user_id: str, user_name: str, event_name: str, data: dict
            ) -> Annotated[dict, Field(description="Response as JSON format containing event, data")]:
    """
        Process incoming events from the client and return a payload to broadcast to all players in the room, 
        or raise a GameError if the event is invalid or cannot be processed.
    """
    if event_name not in event_handlers:
        raise GameError("INVALID_PAYLOAD", "Invalid event")
    if room_id not in manager.rooms:
        raise GameError("ROOM_NOT_FOUND", "Room not found")
    if user_id not in manager.rooms[room_id].players:
        raise GameError("PLAYER_NOT_FOUND", "Player not found in the room")
    if data is None:
        raise GameError("INVALID_PAYLOAD", "Missing data in request")
    handler = event_handlers[event_name]
    context = Context(room_id=room_id, user_id=user_id, user_name=user_name, data=data)
    response = handler(manager, context)
    return response

