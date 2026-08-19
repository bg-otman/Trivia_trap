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
