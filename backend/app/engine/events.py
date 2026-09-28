from __future__ import annotations # to treat type hints as strings to avoid circular imports
from fastapi import WebSocket
from .room_models import PlayerInfo, RoomMetaData, RoomSettings, Room, RoomPhase
from pydantic import Field
from typing import TYPE_CHECKING
from dataProcessing.ingestion import ( validate_bluff_answer, build_voting_choices, validate_vote, calculate_results ) # import demo functions until we have a proper data processing module
from dataProcessing.services import load_categories, load_question
from .utils import GameError, Context, clear_data, validate_phase, lobby_update
import asyncio
import random

if TYPE_CHECKING: # it evaluates to False at runtime, so the import is only for type checking and avoids circular imports
    from .room_manager import RoomManager

async def phase_timer(manager: RoomManager, context: Context, duration: int):
    """
        Transition to the next phase after a delay.
    """
    try:
        await asyncio.sleep(duration)
        room = manager.rooms.get(context.room_id)
        if room is None or room.meta_data.host_id != context.user_id:
            return
        await to_next_phase(manager, context)
    except asyncio.CancelledError:
        # Task was canceled early (all players submitted before deadline).
        pass

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

async def leave_room(manager: RoomManager, context: Context):
    """
        Leave the room and remove the player from the room.
        If the player is the host, transfer host to another player.
    """
    room = manager.rooms.get(context.room_id)
    if context.user_id == room.meta_data.host_id:
        if len(room.players) > 1:
            for player_id in room.players:
                if player_id != context.user_id:
                    room.meta_data.host_id = player_id
                    break
    await manager.remove_connection(context.user_id, context.room_id)
    await manager.broadcast(lobby_update(room), context.room_id, context.user_id)

async def get_categories(manager: RoomManager, context: Context):
    """
        Get the list of random categories for the game.
    """
    room = manager.rooms.get(context.room_id)
    categories = await load_categories(room.meta_data.settings.language)
    if not categories:
        raise GameError("ERROR", "Something went wrong while fetching categories")
    room.meta_data.fallback_category = random.choice(categories)
    await manager.broadcast({
        "event": "PHASE_CATEGORY",
        "data": {
            "round": room.meta_data.current_round,
            "total_rounds": room.meta_data.settings.total_rounds,
            "duration": room.meta_data.settings.vote_time,
            "categories": categories
            }
        }, context.room_id, None)
    room.meta_data.timer_task = asyncio.create_task(phase_timer(manager, context, room.meta_data.settings.vote_time))

async def get_question(manager: RoomManager, context: Context):
    """
        get a question from the selected category.
    """
    room = manager.rooms.get(context.room_id)
    clear_data(room)
    current_task = asyncio.current_task()
    if room.meta_data.phase.current_state == RoomPhase.CATEGORY:
        if (
            room.meta_data.timer_task
            and room.meta_data.timer_task is not current_task
            and not room.meta_data.timer_task.done()
        ):
            room.meta_data.timer_task.cancel()
        room.meta_data.phase.cycle()
    category = context.data.get("category")
    if category is None:
        category = room.meta_data.fallback_category
    category_id = category.get("id")
    language = room.meta_data.settings.language
    question = await load_question(category_id, language)
    if question is None:
        raise GameError("ERROR", "Something went wrong while fetching the question")
    room.meta_data.active_question = question.get("question")
    room.meta_data.image_url = question.get("image_url")
    room.meta_data.correct_answer = question.get("correct_answer")
    room.meta_data.fake_answers = question.get("fake_answers", [])
    await manager.broadcast({
        "event": "PHASE_QUESTION",
        "data": { 
            "category": category.get("name"),
            "question": question.get("question"),
            "question_id": question.get("id"),
            "image_url": room.meta_data.image_url,
            "round": room.meta_data.current_round,
            "total_rounds": room.meta_data.settings.total_rounds,
            "duration": room.meta_data.settings.bluff_time
            } 
        }, context.room_id, None)
    room.meta_data.timer_task = asyncio.create_task(phase_timer(manager, context, room.meta_data.settings.bluff_time))

async def get_vote_choices(manager: RoomManager, context: Context):
    """
        get the vote list for the current question. This includes the correct answer and all bluff answers submitted by players.
    """
    room = manager.rooms.get(context.room_id)
    room.meta_data.voting_choices = build_voting_choices(
        len(room.players),
        room.meta_data.sumbitted_bluffs,
        room.meta_data.correct_answer,
        room.meta_data.fake_answers,
    )
    public_choices = [
        {
            "id": choice["id"],
            "text": choice["text"],
        }
        for choice in room.meta_data.voting_choices
    ]
    await manager.broadcast({
        "event": "PHASE_VOTING",
        "data": { 
            "round": room.meta_data.current_round,
            "total_rounds": room.meta_data.settings.total_rounds,
            "duration": room.meta_data.settings.vote_time,
            "question": {
                "text": room.meta_data.active_question,
                "image_url": room.meta_data.image_url
            },
            "choices": public_choices
            } 
        }, context.room_id, None)
    room.meta_data.timer_task = asyncio.create_task(phase_timer(manager, context, room.meta_data.settings.vote_time))

async def reveal_results(manager: RoomManager, context: Context):
    """
        Reveal the results of the round, including the correct answer, votes, and updated scores.
    """
    room = manager.rooms.get(context.room_id)
    results = calculate_results(
        votes=room.meta_data.voting_results,
        players=room.players,
        voting_choices=room.meta_data.voting_choices,
    )
    room.meta_data.podium = results.get("leaderboard", [])
    results["round"] = room.meta_data.current_round
    results["total_rounds"] = room.meta_data.settings.total_rounds
    room.meta_data.current_round += 1
    await manager.broadcast({
        "event": "RESULTS_REVEALED",
        "data": results
    }, context.room_id, None)

async def podium(manager: RoomManager, context: Context):
    """
        Leaderboard for the current round. This includes the players and their scores for the current round.
    """
    room = manager.rooms.get(context.room_id)
    # if the current round is greater than the total rounds, end the game and reset the room phase to LOBBY
    # but if the two top players have the same score we add a tie breaker round, so we don't end the game yet.
    if (room.meta_data.current_round > room.meta_data.settings.total_rounds 
        and len(room.meta_data.podium) > 1 
        and room.meta_data.podium[0]["score"] != room.meta_data.podium[1]["score"]):
        room.meta_data.phase.end()
    await manager.broadcast({
        "event": "PHASE_PODIUM",
        "data": {
            "round": room.meta_data.current_round,
            "total_rounds": room.meta_data.settings.total_rounds,
            "leaderboard": room.meta_data.podium
        }
    }, context.room_id, None)

game_phases = {
    RoomPhase.CATEGORY : get_categories,
    RoomPhase.QUESTION : get_question,
    RoomPhase.VOTE : get_vote_choices,
    RoomPhase.REVEAL : reveal_results,
    RoomPhase.PODIUM : podium
}

async def to_next_phase(manager: RoomManager, context: Context):
    """
        Transition to the next phase of the game.
        This function is called when the host triggers the next phase 
        or when all players have submitted their answers/bluffs/votes
        or when the timer for the current phase has expired.
    """
    room = manager.rooms.get(context.room_id)
    # start game
    if room.meta_data.phase.current_state == RoomPhase.LOBBY:
        room.meta_data.phase.start()
        await get_categories(manager, context)
        return
    current_task = asyncio.current_task()
    if (
        room.meta_data.timer_task
        and room.meta_data.timer_task is not current_task
        and not room.meta_data.timer_task.done()
    ):
        room.meta_data.timer_task.cancel()
    if room.meta_data.phase.current_state not in game_phases:
        raise GameError("INVALID_PHASE", "Cannot advance to next phase from current phase")
    room.meta_data.phase.cycle()
    handler = game_phases[room.meta_data.phase.current_state]
    await handler(manager, context)

async def submit_bluff(manager: RoomManager, context: Context):
    room = manager.rooms.get(context.room_id)
    bluff_answer = context.data.get("bluff_answer")
    if bluff_answer is None:
        raise GameError("INVALID_PAYLOAD", "Missing bluff answer in request")
    validate_bluff = validate_bluff_answer(bluff_answer, room.meta_data.correct_answer)
    if not validate_bluff.get("is_valid"):
        raise GameError("BLUFF_REJECTED", validate_bluff.get("reason", "EXACT_TRUTH"))
    room.meta_data.sumbitted_bluffs[context.user_id] = bluff_answer
    if len(room.meta_data.sumbitted_bluffs) >= len(room.players):
        await to_next_phase(manager, context)
    else:
        await manager.send_to_player({ 
            "event": "BLUFF_SUBMITTED",
            "data": {
                "player_id": context.user_id,
            }
        }, context.room_id, context.user_id)

async def submit_vote(manager: RoomManager, context: Context):
    room = manager.rooms.get(context.room_id)
    vote_choice = context.data.get("choice_id")
    if vote_choice is None:
        raise GameError("INVALID_PAYLOAD", "Missing vote choice in request")
    validation = validate_vote(
        voter_id=context.user_id,
        choice_id=vote_choice,
        choices=room.meta_data.voting_choices,
        votes=room.meta_data.voting_results,
        player_ids=set(room.players.keys()),
    )

    if not validation["is_valid"]:
        raise GameError(
            validation["reason"],
            "Vote rejected",
        )

    room.meta_data.voting_results[context.user_id] = vote_choice
    if len(room.meta_data.voting_results) >= len(room.players):
        await to_next_phase(manager, context)
    else:
        await manager.send_to_player({ 
            "event": "VOTE_SUBMITTED",
            "data": {
                "player_id": context.user_id,
            }
        }, context.room_id, context.user_id)

async def kick_player(manager: RoomManager, context: Context):
    """
        Kick a player from the room. Only the host can kick players.
    """
    room = manager.rooms.get(context.room_id)
    if context.user_id != room.meta_data.host_id:
        raise GameError("FORBIDDEN", "Only the host can kick players")
    player_id = context.data.get("player_id")
    if player_id not in room.players:
        raise GameError("PLAYER_NOT_FOUND", "Player not found in the room")
    await manager.remove_connection(player_id, context.room_id)
    await manager.broadcast(lobby_update(room), context.room_id, None)

async def update_settings(manager: RoomManager, context: Context):
    room = manager.rooms.get(context.room_id)
    if context.user_id != room.meta_data.host_id:
        raise GameError("FORBIDDEN", "Only the host can update settings")
    try:
        total_rounds = context.data.get("total_rounds")
        bluff_time = context.data.get("bluff_time")
        vote_time = context.data.get("vote_time")
        max_players = context.data.get("max_players")
        language = context.data.get("language")
        new_settings = RoomSettings(total_rounds=total_rounds, bluff_time=bluff_time,
                        vote_time=vote_time, max_players=max_players, language=language)
        room.meta_data.settings = new_settings
        await manager.broadcast(lobby_update(room), context.room_id, None)
    except Exception:
        raise GameError("INVALID_PAYLOAD", "Invalid settings in request")

async def handle_chat_message(manager: RoomManager, context: Context):
    """
        Handle a chat message sent by a player in the room.
    """
    room = manager.rooms.get(context.room_id)
    message = context.data.get("message")
    if message is None or len(message.strip()) == 0:
        raise GameError("INVALID_PAYLOAD", "Missing or empty chat message in request")
    player_info = room.players.get(context.user_id)
    if player_info is None:
        raise GameError("PLAYER_NOT_FOUND", "Player not found in the room")
    await manager.broadcast({
        "event": "CHAT_MESSAGE",
        "data": {
            "player" : { 
                "id": context.user_id, 
                "username": player_info.name, 
                "avatar_url": player_info.avatar_url
            },
            "message": message
        }
    }, context.room_id, None)

event_handlers = {
    "NEXT_PHASE" : to_next_phase,
    "GET_QUESTION" : get_question,
    "SUBMIT_BLUFF" : submit_bluff,
    "SUBMIT_VOTE" : submit_vote,
    "LEAVE_ROOM" : leave_room,
    "KICK_PLAYER" : kick_player,
    "UPDATE_SETTINGS" : update_settings,
    "CHAT_MESSAGE" : handle_chat_message,
}

async def process_event(manager: RoomManager, room_id: str, user_id: str, user_name: str, event_name: str, data: dict
            ) -> None:
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
    current_phase = manager.rooms[room_id].meta_data.phase.current_state
    validate_phase(current_phase, event_name)
    handler = event_handlers[event_name]
    context = Context(room_id=room_id, user_id=user_id, user_name=user_name, data=data)
    await handler(manager, context)