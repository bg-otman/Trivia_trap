from room_manager import PlayerInfo, Room, RoomMetaData, RoomSettings
from fastapi import WebSocket
from pydantic import Field

def join_room(rooms: dict, ws: WebSocket, room_id: str, player_id: str, name: str):
    """
        Join or Create Room if it does not exist. If the room exists, add the player to the room. If the room is full, raise an error.
    """
    if room_id not in rooms:
        rooms[room_id] = Room(meta_data=RoomMetaData(host_id=player_id, settings=Field(default_factory=RoomSettings)), players=Field(default_factory=dict))
    room = rooms[room_id]
    if len(room.players) >= room.meta_data.settings.max_players:
        raise ValueError("FULL_ROOM")
    room.players[player_id] = PlayerInfo(ws=ws, name=name)
