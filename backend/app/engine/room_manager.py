from fastapi import APIRouter, WebSocket
from typing import Annotated

router = APIRouter(prefix="/room", tags=["Room"])

class ConnectionManger():
    pass

@router.websocket("/{room_id}")
async def room(ws: WebSocket, room_id: str):
    return {"THIS is room page" : "YES it is"}