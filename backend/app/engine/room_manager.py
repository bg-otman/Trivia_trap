from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query
from typing import Annotated
from pydantic import Field
from .room_models import Room
from .events import join_room

router = APIRouter(prefix="/room", tags=["Room"])

class RoomManager():
    def __init__(self):
        self.rooms : Annotated[dict[str, Room], Field(description="Dictionary of rooms with room_id as key and Room object as value")] = {}

    async def connect(self, ws: WebSocket, room_id: str):
        await ws.accept()
        if not ws.state.user_id or not ws.state.user_name:
            raise ValueError("UNAUTHORIZED")
        join_room(self.rooms, ws, room_id, ws.state.user_id, ws.state.user_name)

    async def broadcast(self, data: Annotated[str, Field(description="Data in JSON format")], room_id: str):
        if room_id not in self.rooms:
            raise ValueError("ROOM_NOT_FOUND")
        for id, player in self.rooms.get(room_id).players.items():
            try:
                await player.ws.send_json(data)
            except Exception as e:
                print(f"Error broadcast data by {player.name} in room {room_id}: {e}")
                self.remove_connection(id, room_id)

    def remove_connection(self, player_id: str, room_id: str):
        """
            remove disconnected user from the list of active rooms
        """
        if room_id not in self.rooms:
            raise ValueError("ROOM_NOT_FOUND")
        player = self.rooms.get(room_id).players.get(player_id)
        if player is not None:
            del self.rooms[room_id].players[player_id]
        if room_id in self.rooms and not self.rooms[room_id].players:
            del self.rooms[room_id]

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
            data = await ws.receive_text()
            payload = {
                "room_id": room_id,
                "user_id": user_id,
                "user_name": user_name,
                "data": data
            }
            print(f"data sent by user {user_name} in room {room_id}: {data}")
            await manager.broadcast(payload, room_id)
    except ValueError as ve:
        print(f"Connection error: {ve}")
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
    except WebSocketDisconnect:
        print(f"Player {user_name} disconnected from room {room_id}")
        manager.remove_connection(ws.state.user_id, room_id)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

