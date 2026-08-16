from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query
from typing import Annotated
from dataclasses import dataclass

router = APIRouter(prefix="/room", tags=["Room"])

@dataclass
class Player:
    ws: WebSocket
    user_id: str
    user_name: str
    room_id: str

class RoomManager():
    def __init__(self):
        self.connections : Annotated[dict[str, dict[str, Player]], "list of active connections on each room, grouped by room_id and user_id"] = dict()

    async def connect(self, ws: WebSocket, room_id: str):
        await ws.accept()
        if not ws.state.user_id or not ws.state.user_name:
            raise ValueError("Token is invalid, user_id or user_name is missing")
        if room_id not in self.connections:
            self.connections[room_id] = {}
        self.connections[room_id][ws.state.user_id] = Player(ws=ws, user_id=ws.state.user_id, user_name=ws.state.user_name, room_id=room_id)

    async def broadcast(self, data: Annotated[str, "Data in JSON format"], room_id: str):
        for player in list(self.connections.get(room_id, {}).values()):
            try:
                await player.ws.send_json(data)
            except Exception:
                self.remove_connection(player.ws, room_id)

    def remove_connection(self, ws: WebSocket, room_id: str):
        """
            remove disconnected user from the list of active connections
        """
        player = None
        for p in self.connections.get(room_id, {}).values():
            if p.ws == ws:
                player = p
                break
        if player and room_id in self.connections:
            del self.connections[room_id][player.user_id]
        if room_id in self.connections and not self.connections[room_id]:
            del self.connections[room_id]

    async def kick(self, ws: WebSocket, room_id: str):
        """
            Kick a user from the room
        """
        self.remove_connection(ws, room_id)
        try:
            await ws.close()
        except Exception:
            pass


manager = RoomManager()

@router.websocket("/{room_id}")
async def room(ws: WebSocket, room_id: str, user_id : Annotated[str, Query()], user_name : Annotated[str, Query()]):

    # here i need to retrieve user_id, user_name form JWT... To be implemented by Auth responsible
    # for now i will use query params.

    ws.state.user_id = user_id
    ws.state.user_name = user_name
    ws.state.room_id = room_id

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
        manager.remove_connection(ws, room_id)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

