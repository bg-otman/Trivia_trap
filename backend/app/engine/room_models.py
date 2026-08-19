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
    VOTE = State("Vote")
    REVEAL = State("Reveal")
    PODIUM = State("Podium")

    start = LOBBY.to(CATEGORY)
    end = PODIUM.to(LOBBY)

    cycle = (
        CATEGORY.to(QUESTION) |
        QUESTION.to(VOTE) |
        VOTE.to(REVEAL) |
        REVEAL.to(PODIUM) |
        PODIUM.to(CATEGORY)
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
    current_round: int = 1
    active_question: Annotated[str | None, Field(description="The current question being asked in the room")] = None
    correct_answer: Annotated[str | None, Field(description="The correct answer for the current question")] = None
    sumbitted_bluffs: Annotated[dict[str, str], Field(description="Map of player_id to their submitted bluff answer")] = Field(default_factory=dict)
    fake_answers: Annotated[list[str], Field(description="Additional fake answers for the current question")] = Field(default_factory=list)
    voting_results: Annotated[dict[str, str], Field(description="Map of player_id to the answer they voted for")] = Field(default_factory=dict)
    podium: Annotated[list[dict[str, str]], Field(description="List of players and their scores for the current round")] = Field(default_factory=list)

class Room(BaseModel):
    meta_data: RoomMetaData
    players: Annotated[dict[str, PlayerInfo], Field(description="Map each player with it's id to get faster player lookup")] = Field(default_factory=dict)

