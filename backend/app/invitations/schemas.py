from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SendInvitation(BaseModel):
    recipient_id: int = Field(ge=1, le=2147483647)
    room_code: str = Field(min_length=6, max_length=6, pattern=r"^[A-Za-z0-9]{6}$")


class InvitationResponse(BaseModel):
    id: UUID
    room_code: str
    status: str
    created_at: datetime
    expires_at: datetime
    inviter_id: str
    inviter_username: str
    inviter_avatar_url: str | None = None


class AcceptInvitationResponse(BaseModel):
    room_code: str
