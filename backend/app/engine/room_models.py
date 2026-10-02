from fastapi import WebSocket
from pydantic import BaseModel, Field, ConfigDict
from typing import Annotated
from statemachine import StateMachine, State
import asyncio

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
    user_id: int | None = None
    bluff_votes_received: int = 0
    on_fire_eligible: bool = False
    remontada_eligible: bool = False
    is_present: Annotated[bool, Field(description="Indicates if the player is currently connected to the room")] = True
    avatar_url: Annotated[str | None, Field(description="URL to the player's avatar image")] = None

class RoomSettings(BaseModel):
    total_rounds: Annotated[int, Field(ge=1, description="At least one round")] = 10
    bluff_time: Annotated[int, Field(ge=10, description="Time in seconds to provide answer")] = 20
    vote_time: Annotated[int, Field(ge=10, description="Time in seconds to vote for the correct answer")] = 15
    max_players: Annotated[int, Field(ge=2, description="Maximum number of players in the room")] = 10
    language: Annotated[str, Field(description="Language code for the game questions")] = "en"

class RoomMetaData(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True) # Allow RoomPhase type in Pydantic model
    host_id: str
    settings: RoomSettings
    phase: Annotated[RoomPhase, Field(description="Access to the room phase state machine by phase.current_state")] = Field(default_factory=RoomPhase)
    timer_task: Annotated[asyncio.Task | None, Field(description="Timer task to trigger next phase when timeout")] = None
    current_round: int = 1
    active_question: Annotated[str | None, Field(description="The current question being asked in the room")] = None
    fallback_category: Annotated[dict[str, str], Field(description="The fallback category if no category is selected")] = Field(default_factory=dict)
    image_url: Annotated[str | None, Field(description="The image URL associated with the current question, if any")] = None
    correct_answer: Annotated[str | None, Field(description="The correct answer for the current question")] = None
    sumbitted_bluffs: Annotated[dict[str, str], Field(description="Map of player_id to their submitted bluff answer")] = Field(default_factory=dict)
    fake_answers: Annotated[list[str], Field(description="Additional fake answers for the current question")] = Field(default_factory=list)
    voting_choices: Annotated[list[dict], Field(description="The answer choices broadcast during the voting phase")] = Field(default_factory=list)
    voting_results: Annotated[dict[str, str], Field(description="Map of player_id to the answer they voted for")] = Field(default_factory=dict)
    podium: Annotated[list[dict[str, str]], Field(description="List of players and their scores for the current round")] = Field(default_factory=list)
    correct_answer_streaks: dict[str, int] = Field(default_factory=dict)
    truth_seeker_announced: set[str] = Field(default_factory=set)
    correct_answer_totals: dict[str, int] = Field(default_factory=dict)
    einstein_announced: set[str] = Field(default_factory=set)
    round_results_processed: bool = False
    remontada_midpoint_round: int = 0
    remontada_last_player_ids: set[str] | None = None
    match: dict | None = None
    match_players: dict[str, dict] = Field(default_factory=dict)
    pending_round: dict | None = None
    pending_finish: dict | None = None
    last_match_result: dict | None = None
    persistence_lock: asyncio.Lock = Field(default_factory=asyncio.Lock)
    event_lock: asyncio.Lock = Field(default_factory=asyncio.Lock)

class Room(BaseModel):
    meta_data: RoomMetaData
    players: Annotated[dict[str, PlayerInfo], Field(description="Map each player with it's id to get faster player lookup")] = Field(default_factory=dict)
