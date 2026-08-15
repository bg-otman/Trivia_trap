from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Annotated

router = APIRouter(prefix="/room", tags=["Room"])

class ConnectionManager():
    def __init__(self):
        self.connections : Annotated[dict[str, set[WebSocket]], "list of active connections on each room"] = dict()

    async def connect(self, ws: WebSocket, room_id: str):
        await ws.accept()
        if room_id not in self.connections:
            self.connections[room_id] = set()
        self.connections[room_id].add(ws)

    async def broadcast(self, data: Annotated[str, "Data in JSON format"], room_id: str):
        for user in list(self.connections.get(room_id, set())):
            try:
                await user.send_json(data)
            except (RuntimeError, WebSocketDisconnect):
                self.remove_connection(user)

    def remove_connection(self, ws: WebSocket, room_id: str):
        """
            remove disconnected user from the list of active connections
        """
        if room_id in self.connections:
            self.connections[room_id].discard(ws)
        if not self.connections[room_id]:
            del self.connections[room_id]

    async def kick(self, ws: WebSocket, room_id: str):
        """
            Kick a user from the room
        """
        self.remove_connection(ws, room_id)
        try:
            await ws.close()
        except RuntimeError:
            pass


manager = ConnectionManager()

@router.websocket("/{room_id}")
async def room(ws: WebSocket, room_id: str):
    await manager.connect(ws, room_id)
    try:
        while True:
            data = await ws.receive_text()
            print(f"Room {room_id} | Data received: {data}")
            payload = {
                "info": f"this content was sent from room: {room_id}",
                "content": data
            }
            await manager.broadcast(payload, room_id)
    except WebSocketDisconnect:
        print(f"Client disconnected from room {room_id}")
        manager.remove_connection(ws, room_id)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

