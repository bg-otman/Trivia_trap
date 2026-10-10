from datetime import datetime

from pydantic import BaseModel


class IncomingFriendRequest(BaseModel):
    id: str
    username: str
    avatar_url: str | None = None
    created_at: datetime


class FriendResponse(BaseModel):
    id: str
    username: str
    avatar_url: str | None = None
    is_online: bool
