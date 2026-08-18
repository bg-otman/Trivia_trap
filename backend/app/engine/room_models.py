from fastapi import WebSocket
from pydantic import BaseModel, Field, ConfigDict
from typing import Annotated
from statemachine import StateMachine, State

class RoomPhase(StateMachine):
    """
        RoomPhase is a state machine that represents the different phases of a room.
    """
    LOBBY = State("Lobby", initial=True)
    CATEGORY = State("Category Selection")
    QUESTION = State("Question")
    BLUFF = State("Bluff")
    VOTE = State("Vote")
    REVEAL = State("Reveal")
    PODIUM = State("Podium")

    cycle = (
        LOBBY.to(CATEGORY) |
        CATEGORY.to(QUESTION) |
        QUESTION.to(BLUFF) |
        BLUFF.to(VOTE) |
        VOTE.to(REVEAL) |
        REVEAL.to(PODIUM) |
        PODIUM.to(LOBBY)
    )

class PlayerInfo(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True) # Allow WebSocket type in Pydantic model
    ws: WebSocket
    name: Annotated[str, Field(min_length=1, max_length=15)]
    score: Annotated[int, Field(ge=0)] = 0
    is_present: Annotated[bool, Field(description="Indicates if the player is currently connected to the room")] = True

class RoomSettings(BaseModel):
    total_rounds: Annotated[int, Field(ge=1, description="At least one round")] = 10
    bluff_time: Annotated[int, Field(ge=10, description="Time in seconds to provide answer")] = 20
    vote_time: Annotated[int, Field(ge=10, description="Time in seconds to vote for the correct answer")] = 15
    max_players: Annotated[int, Field(ge=2, description="Maximum number of players in the room")] = 10

class RoomMetaData(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True) # Allow RoomPhase type in Pydantic model
    host_id: str
    settings: RoomSettings
    phase: Annotated[RoomPhase, Field(description="Access to the room phase state machine by phase.current_state")] = RoomPhase()
    current_round: int = 0

class Room(BaseModel):
    meta_data: RoomMetaData
    players: Annotated[dict[str, PlayerInfo], Field(description="Map each player with it's id to get faster player lookup")] = Field(default_factory=dict)

