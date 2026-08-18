from fastapi import WebSocket
from .room_models import PlayerInfo, RoomMetaData, RoomSettings, Room

def join_room(rooms: dict, ws: WebSocket, room_id: str, player_id: str, name: str):
    """
        Join or Create Room if it does not exist. If the room exists, add the player to the room. If the room is full, raise an error.
    """
    if rooms.get(room_id) is None:
        rooms[room_id] = Room(meta_data=RoomMetaData(host_id=player_id, settings=RoomSettings()), players={})
        print(f"Room {room_id} created by {name} ({player_id})")
    else:
        print(f"{name} with id ({player_id}) joined room {room_id}")
    room = rooms[room_id]
    if len(room.players) >= room.meta_data.settings.max_players:
        raise ValueError("FULL_ROOM")
    room.players[player_id] = PlayerInfo(ws=ws, name=name)
