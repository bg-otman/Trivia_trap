from fastapi import WebSocket
from pydantic import BaseModel, Field
from typing import Annotated

class PlayerInfo(BaseModel):
    ws: WebSocket
    name: Annotated[str, Field(min_length=1, max_length=15)]
    score: Annotated[int, Field(ge=0)] = 0
    is_present: Annotated[bool, "Indicates if the player is currently connected to the room"] = True

class RoomSettings(BaseModel):
    total_rounds: Annotated[int, Field(ge=1), "At least one round"] = 10
    bluff_time: Annotated[int, Field(ge=10), "Time in seconds to provide answer"] = 20
    vote_time: Annotated[int, Field(ge=10), "Time in seconds to vote for the correct answer"] = 15
    max_players: Annotated[int, Field(ge=2), "Maximum number of players in the room"] = 10

class RoomMetaData(BaseModel):
    host_id: str
    settings: RoomSettings
    current_phase: Annotated[str, "Current phase of the room, set based on the game state"] = 'LOBBY_UPDATE'
    current_round: int = 0

class Room(BaseModel):
    meta_data: RoomMetaData
    players: Annotated[dict[str, PlayerInfo], "Map each player with it's id to get faster player lookup"] = Field(default_factory=dict)

