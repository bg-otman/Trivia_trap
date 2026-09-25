from __future__ import annotations # to treat type hints as strings to avoid circular imports
from fastapi import WebSocket
from .room_models import PlayerInfo, RoomMetaData, RoomSettings, Room, RoomPhase
from pydantic import Field
from typing import TYPE_CHECKING
from dataProcessing.ingestion import (
    build_voting_choices,
    calculate_results,
    validate_bluff_answer,
    validate_vote,
)
from dataProcessing.services import load_categories, load_question
from .utils import GameError, Context, clear_data, validate_phase, lobby_update
import asyncio
import logging
import random

logger = logging.getLogger(__name__)

if TYPE_CHECKING: # it evaluates to False at runtime, so the import is only for type checking and avoids circular imports
    from .room_manager import RoomManager

def cancel_phase_timer(room: Room) -> None:
    task = room.meta_data.timer_task
    if task and task is not asyncio.current_task() and not task.done():
        task.cancel()
    room.meta_data.timer_task = None


def schedule_phase_timer(
    manager: RoomManager,
    room_id: str,
    expected_phase: RoomPhase,
    duration: int,
) -> None:
    room = manager.rooms.get(room_id)
    if room is None:
        return
    cancel_phase_timer(room)
    room.meta_data.timer_task = asyncio.create_task(
        phase_timer(manager, room_id, expected_phase, duration)
    )


async def phase_timer(
    manager: RoomManager,
    room_id: str,
    expected_phase: RoomPhase,
    duration: int,
):
    """
        Transition to the next phase after a delay.
    """
    current_task = asyncio.current_task()
    try:
        await asyncio.sleep(duration)
        room = manager.rooms.get(room_id)
        if (
            room is None
            or room.meta_data.timer_task is not current_task
            or room.meta_data.phase.current_state != expected_phase
        ):
            return
        await advance_phase(manager, room_id, expected_phase)
    except asyncio.CancelledError:
        return
    except Exception:
        logger.exception(
            "Phase timer failed for room %s in phase %s",
            room_id,
            expected_phase,
        )
        await manager.broadcast(
            {
                "event": "ERROR",
                "data": {
                    "code": "SERVER_ERROR",
                    "message": "The game could not advance after the timer expired",
                },
            },
            room_id,
            None,
        )
    finally:
        room = manager.rooms.get(room_id)
        if room is not None and room.meta_data.timer_task is current_task:
            room.meta_data.timer_task = None

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
    await reevaluate_room_progress(manager, context.room_id)
    await manager.broadcast(lobby_update(room), context.room_id, context.user_id)

async def get_categories(manager: RoomManager, context: Context):
    """
        Get the list of random categories for the game.
    """
    room = manager.rooms.get(context.room_id)
    categories = await load_categories(room.meta_data.settings.language)
    clear_data(room)
    room.meta_data.fallback_category = random.choice(categories)
    await manager.broadcast({
        "event": "PHASE_CATEGORY",
        "data": {
            "round": room.meta_data.current_round,
            "total_rounds": room.meta_data.settings.total_rounds,
            "categories": categories
            }
        }, context.room_id, None)
    schedule_phase_timer(
        manager,
        context.room_id,
        RoomPhase.CATEGORY,
        room.meta_data.settings.vote_time,
    )

def selected_category(room: Room, context: Context) -> dict:
    category = context.data.get("category")
    if category is None:
        category = room.meta_data.fallback_category
    if not isinstance(category, dict):
        raise GameError("INVALID_PAYLOAD", "Category must be an object")
    category_id = category.get("id")
    if type(category_id) is not int:
        raise GameError("INVALID_PAYLOAD", "category.id must be an integer")
    return category


async def load_and_broadcast_question(manager: RoomManager, context: Context):
    """Load and broadcast a question for the selected or fallback category."""
    room = manager.rooms.get(context.room_id)
    category = selected_category(room, context)
    clear_data(room)
    category_id = category["id"]
    language = room.meta_data.settings.language
    question = await load_question(category_id, language)
    if question is None:
        raise GameError("NO_QUESTION", "No question available for the selected category")
    room.meta_data.active_question = question.get("question")
    room.meta_data.image_url = question.get("image_url")
    room.meta_data.correct_answer = question.get("correct_answer")
    room.meta_data.fake_answers = question.get("fake_answers", [])
    await manager.broadcast({
        "event": "PHASE_QUESTION",
        "data": { 
            "category": category.get("name"),
            "category_id": category_id,
            "question": question.get("question"),
            "question_id": question.get("id"),
            "image_url": room.meta_data.image_url,
            "round": room.meta_data.current_round,
            "total_rounds": room.meta_data.settings.total_rounds,
            "duration": room.meta_data.settings.bluff_time
            } 
        }, context.room_id, None)
    schedule_phase_timer(
        manager,
        context.room_id,
        RoomPhase.QUESTION,
        room.meta_data.settings.bluff_time,
    )


async def get_question(manager: RoomManager, context: Context):
    room = manager.rooms.get(context.room_id)
    async with room.meta_data.state_lock:
        if room.meta_data.phase.current_state != RoomPhase.CATEGORY:
            raise GameError("INVALID_PHASE", "Not in category selection phase")
        selected_category(room, context)
        cancel_phase_timer(room)
        room.meta_data.phase.cycle()
        await load_and_broadcast_question(manager, context)

async def get_vote_choices(manager: RoomManager, context: Context):
    """
        get the vote list for the current question. This includes the correct answer and all bluff answers submitted by players.
    """
    room = manager.rooms.get(context.room_id)
    choices = build_voting_choices(
        len(room.players),
        room.meta_data.sumbitted_bluffs,
        room.meta_data.correct_answer,
        room.meta_data.fake_answers,
    )
    room.meta_data.voting_choices = choices
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
            "choices": [
                {
                    "id": choice["id"],
                    "text": choice["text"],
                }
                for choice in choices
            ]
            } 
        }, context.room_id, None)
    schedule_phase_timer(
        manager,
        context.room_id,
        RoomPhase.VOTE,
        room.meta_data.settings.vote_time,
    )

async def reveal_results(manager: RoomManager, context: Context):
    """
    Reveal the results of the round, including the correct answer, votes, and updated scores.
    """
    room = manager.rooms.get(context.room_id)
    results = calculate_results(
        room.meta_data.voting_results,
        room.meta_data.voting_choices,
        room.players,
    )
    for player_id, stats in results["player_stats"].items():
        room.players[player_id].score += stats["round_points"]

    leaderboard = [
        {
            "username": player.name,
            "score": player.score,
            "avatar_url": player.avatar_url,
        }
        for player in room.players.values()
    ]
    leaderboard.sort(key=lambda item: (-item["score"], item["username"]))
    results["leaderboard"] = leaderboard
    room.meta_data.podium = leaderboard
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
    RoomPhase.QUESTION : load_and_broadcast_question,
    RoomPhase.VOTE : get_vote_choices,
    RoomPhase.REVEAL : reveal_results,
    RoomPhase.PODIUM : podium
}

async def advance_phase_locked(manager: RoomManager, context: Context) -> None:
    room = manager.rooms.get(context.room_id)
    cancel_phase_timer(room)
    if room.meta_data.phase.current_state not in game_phases:
        raise GameError("INVALID_PHASE", "Cannot advance to next phase from current phase")
    previous_state_value = room.meta_data.phase.current_state_value
    try:
        room.meta_data.phase.cycle()
        handler = game_phases[room.meta_data.phase.current_state]
        await handler(manager, context)
    except Exception:
        room.meta_data.phase.current_state_value = previous_state_value
        raise


async def advance_phase(
    manager: RoomManager,
    room_id: str,
    expected_phase: RoomPhase | None = None,
) -> bool:
    room = manager.rooms.get(room_id)
    if room is None:
        return False
    async with room.meta_data.state_lock:
        if expected_phase is not None and room.meta_data.phase.current_state != expected_phase:
            return False
        context = Context(
            room_id=room_id,
            user_id=room.meta_data.host_id,
            user_name=(
                room.players[room.meta_data.host_id].name
                if room.meta_data.host_id in room.players
                else "system"
            ),
            data={},
        )
        await advance_phase_locked(manager, context)
        return True


async def to_next_phase(manager: RoomManager, context: Context):
    """Handle the host-only external NEXT_PHASE event."""
    room = manager.rooms.get(context.room_id)
    async with room.meta_data.state_lock:
        if context.user_id != room.meta_data.host_id:
            raise GameError("FORBIDDEN", "Only the host can advance to the next phase")
        if room.meta_data.phase.current_state == RoomPhase.LOBBY:
            room.meta_data.phase.start()
            await get_categories(manager, context)
            return
        await advance_phase_locked(manager, context)


def eligible_player_ids(room: Room) -> set[str]:
    return {
        player_id
        for player_id, player in room.players.items()
        if player.is_present
    }


async def reevaluate_room_progress(manager: RoomManager, room_id: str) -> None:
    """Advance when every remaining connected player has submitted."""
    room = manager.rooms.get(room_id)
    if room is None:
        return
    async with room.meta_data.state_lock:
        eligible_ids = eligible_player_ids(room)
        if not eligible_ids:
            return
        phase = room.meta_data.phase.current_state
        all_submitted = (
            phase == RoomPhase.QUESTION
            and eligible_ids.issubset(room.meta_data.sumbitted_bluffs)
        ) or (
            phase == RoomPhase.VOTE
            and eligible_ids.issubset(room.meta_data.voting_results)
        )
        if not all_submitted:
            return
        context = Context(
            room_id=room_id,
            user_id=room.meta_data.host_id,
            user_name=(
                room.players[room.meta_data.host_id].name
                if room.meta_data.host_id in room.players
                else "system"
            ),
            data={},
        )
        await advance_phase_locked(manager, context)



async def submit_bluff(manager: RoomManager, context: Context):
    room = manager.rooms.get(context.room_id)
    async with room.meta_data.state_lock:
        if room.meta_data.phase.current_state != RoomPhase.QUESTION:
            raise GameError("INVALID_PHASE", "Not in bluff submission phase")
        bluff_answer = context.data.get("bluff_answer")
        if not isinstance(bluff_answer, str):
            raise GameError("INVALID_PAYLOAD", "Missing or invalid bluff answer in request")
        validate_bluff = validate_bluff_answer(bluff_answer, room.meta_data.correct_answer)
        if not validate_bluff.get("is_valid"):
            raise GameError("BLUFF_REJECTED", validate_bluff.get("reason", "EXACT_TRUTH"))
        room.meta_data.sumbitted_bluffs[context.user_id] = bluff_answer
        eligible_ids = eligible_player_ids(room)
        if eligible_ids and eligible_ids.issubset(room.meta_data.sumbitted_bluffs):
            await advance_phase_locked(manager, context)
            return
        await manager.send_to_player({
            "event": "BLUFF_SUBMITTED",
            "data": {
                "player_id": context.user_id,
            }
        }, context.room_id, context.user_id)

async def submit_vote(manager: RoomManager, context: Context):
    room = manager.rooms.get(context.room_id)
    async with room.meta_data.state_lock:
        if room.meta_data.phase.current_state != RoomPhase.VOTE:
            raise GameError("INVALID_PHASE", "Not in voting phase")
        vote_choice = context.data.get("choice_id")
        if not isinstance(vote_choice, str):
            raise GameError("INVALID_PAYLOAD", "choice_id must be a string")

        eligible_ids = eligible_player_ids(room)
        validation = validate_vote(
            context.user_id,
            vote_choice,
            room.meta_data.voting_choices,
            room.meta_data.voting_results,
            eligible_ids,
        )
        if not validation["is_valid"]:
            reason = validation["reason"]
            raise GameError(reason, reason.replace("_", " ").title())

        room.meta_data.voting_results[context.user_id] = vote_choice
        if eligible_ids and eligible_ids.issubset(room.meta_data.voting_results):
            await advance_phase_locked(manager, context)
            return
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
    await reevaluate_room_progress(manager, context.room_id)
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
