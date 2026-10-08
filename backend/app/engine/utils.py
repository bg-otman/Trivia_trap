from .room_models import RoomPhase, Room
from pydantic import Field, BaseModel
from typing import Annotated

class GameError(Exception):
    """
        Custom exception class for game-related errors.
    """
    def __init__(self, error_code: str = "SERVER_ERROR", message: str = "An unexpected error occurred"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

    def to_dict(self) -> dict:
        return {
            "event": "ERROR",
            "data": {
                "code": self.error_code,
                "message": self.message
            }
        }

    def __str__(self) -> str:
        return f"{self.error_code}: {self.message}"


class Context(BaseModel):
    """
        Context class to hold information about the current state of the game.
    """
    room_id: Annotated[str, Field(min_length=1)]
    user_id: Annotated[str, Field(min_length=1)]
    user_name: Annotated[str, Field(min_length=1, max_length=15)]
    data: Annotated[dict, Field(description="Data in JSON format")] = Field(default_factory=dict)

def validate_phase(current_phase: str, event_name: str) -> None:
    """
        Validate if the current phase is valid for the requested action.
    """
    game_phases = ["GET_QUESTION", "SUBMIT_BLUFF", "SUBMIT_VOTE"]
    if event_name in {"LEAVE_ROOM", "KICK_PLAYER", "CHAT_MESSAGE", "RETURN_TO_LOBBY"}:
        return
    if current_phase == RoomPhase.LOBBY and event_name in game_phases:
        raise GameError("INVALID_PHASE", "Game has not started yet")
    if current_phase != RoomPhase.LOBBY and event_name == "UPDATE_SETTINGS":
        raise GameError("INVALID_PHASE", "Game has already started")
    if current_phase == RoomPhase.CATEGORY and event_name != "GET_QUESTION":
        raise GameError("INVALID_PHASE", "Not in category selection phase")
    if current_phase == RoomPhase.QUESTION and event_name != "SUBMIT_BLUFF":
        raise GameError("INVALID_PHASE", "Not in bluff submission phase")
    if current_phase == RoomPhase.VOTE and event_name != "SUBMIT_VOTE":
        raise GameError("INVALID_PHASE", "Not in voting phase")
    if (current_phase == RoomPhase.REVEAL or current_phase == RoomPhase.PODIUM) and event_name != "NEXT_PHASE":
        raise GameError("INVALID_PHASE", "only next phase is allowed in reveal or podium phase")

def lobby_update(room: Room):
    """
        Returns a dictionary representing the current state of the lobby.
    """
    return {
        "event": "LOBBY_UPDATE",
        "data": {
            "host_id": room.meta_data.host_id,
            "round": room.meta_data.current_round,
            "players": [
                {
                    "player_id": player_id,
                    "username": player.name,
                    "is_present": player.is_present,
                    "score": player.score
                } for player_id, player in room.players.items()
            ],
            "settings": room.meta_data.settings.model_dump()
        }
    }

def clear_data(room: Room):
    """
        Clear the room's data for a new round.
    """
    room.meta_data.active_question = None
    room.meta_data.image_url = None
    room.meta_data.correct_answer = None
    room.meta_data.phase_payload = None
    room.meta_data.phase_deadline = None
    room.meta_data.submitted_bluffs.clear()
    room.meta_data.fake_answers.clear()
    room.meta_data.voting_choices.clear()
    room.meta_data.voting_results.clear()
    room.meta_data.podium.clear()
