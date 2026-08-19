from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query
from typing import Annotated
from pydantic import Field
from .utils import GameError
from .room_models import Room
from .events import join_room, process_event
from json import JSONDecodeError

router = APIRouter(prefix="/room", tags=["Room"])

class RoomManager():
    def __init__(self):
        self.rooms : Annotated[dict[str, Room], Field(description="Dictionary of rooms with room_id as key and Room object as value")] = {}

    async def connect(self, ws: WebSocket, room_id: str):
        await ws.accept()
        if not ws.state.user_id or not ws.state.user_name:
            raise GameError("INVALID_PAYLOAD", "Missing user_id or user_name in WebSocket state")
        join_room(self.rooms, ws, room_id, ws.state.user_id, ws.state.user_name)

    async def broadcast(self, data: Annotated[str | dict, Field(description="Data in JSON format")], room_id: str,
                        exclude : Annotated[str, Field(description="Player ID to exclude from broadcast")] = None):
        if room_id not in self.rooms:
            return
        for id, player in self.rooms.get(room_id).players.copy().items():
            if id == exclude:
                continue
            try:
                if player.is_present:
                    await player.ws.send_json(data)
            except Exception:
                self.mark_disconnected(id, room_id)

    async def send_to_player(self, data: Annotated[str | dict, Field(description="Data in JSON format")], room_id: str, player_id: str):
        if room_id not in self.rooms:
            return
        player = self.rooms.get(room_id).players.get(player_id)
        if player is None or not player.is_present:
            return
        try:
            await player.ws.send_json(data)
        except Exception:
            self.mark_disconnected(player_id, room_id)

    def remove_connection(self, player_id: str, room_id: str):
        """
            remove disconnected user from the list of active rooms
        """
        if room_id not in self.rooms:
            return
        player = self.rooms.get(room_id).players.get(player_id)
        if player is not None:
            del self.rooms[room_id].players[player_id]
        if room_id in self.rooms and not self.rooms[room_id].players:
            del self.rooms[room_id]

    def mark_disconnected(self, player_id: str, room_id: str):
        """
            Mark a user as disconnected in the room, but keep them in the room for a while in case they reconnect.
        """
        if room_id not in self.rooms:
            return
        player = self.rooms.get(room_id).players.get(player_id)
        if player is not None:
            player.is_present = False

    async def kick(self, player_id: str, room_id: str):
        """
            Kick a user from the room
        """
        try:
            ws = self.rooms[room_id].players[player_id].ws
            await ws.close()
        except Exception:
            pass
        self.remove_connection(player_id, room_id)


manager = RoomManager()


def get_available_rooms(manager: RoomManager = manager) -> dict[str, Room]:
    """
        Get available rooms with their player count and settings.
    """
    return {
        room_id: {
            "player_count": len(room.players),
            "settings": room.meta_data.settings.model_dump(),
        } for room_id, room in manager.rooms.items()
    }

@router.websocket("/{room_id}")
async def room(ws: WebSocket, room_id: str, user_id : Annotated[str, Query()], user_name : Annotated[str, Query()]):

    # here i need to retrieve user_id, user_name form JWT... To be implemented by Auth responsible
    # for now i will use query params.

    ws.state.user_id = user_id
    ws.state.user_name = user_name

    try:
        await manager.connect(ws, room_id)
        while True:
            try:
                request = await ws.receive_json()
                event_name = request.get("event")
                data = request.get("data")
                if not event_name or "data" not in request:
                    raise GameError("INVALID_PAYLOAD", "Missing event name or data in request")
                response = process_event(manager, room_id, user_id, user_name, event_name, data)
                await manager.broadcast(response, room_id, None)
            except GameError as e:
                await manager.send_to_player(e.to_dict(), room_id, user_id)
            except JSONDecodeError:
                await manager.send_to_player({"event": "ERROR", "data": {"code": "INVALID_PAYLOAD", "message": "Invalid JSON format"}}, room_id, user_id)
    except WebSocketDisconnect:
        manager.mark_disconnected(user_id, room_id)
        await manager.broadcast({"event": "PLAYER_DISCONNECTED", "data": {"player_id": user_id, "player_name": user_name}}, room_id, user_id)
    except GameError as e:
        await manager.send_to_player(e.to_dict(), room_id, user_id)
    except Exception as e:
        print(f"An unexpected error occurred. Type: {type(e).__name__} | Message: {e}")
        try:
            manager.remove_connection(ws.state.user_id, room_id)
            await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        except Exception:
            pass

