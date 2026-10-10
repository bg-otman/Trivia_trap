import asyncio
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from invitations.realtime import NotificationConnections
from invitations.schemas import InvitationResponse, SendInvitation


class _WebSocket:
    def __init__(self):
        self.accepted = False
        self.messages = []

    async def accept(self):
        self.accepted = True

    async def send_json(self, payload):
        self.messages.append(payload)


def test_send_invitation_accepts_valid_payload():
    payload = SendInvitation(recipient_id=42, room_code="a1b2c3")
    assert payload.recipient_id == 42
    assert payload.room_code == "a1b2c3"


def test_invitation_response_contains_join_context():
    now = datetime.now(timezone.utc)
    invitation = InvitationResponse(
        id=uuid4(), room_code="ABC123", status="pending",
        created_at=now, expires_at=now + timedelta(hours=2),
        inviter_id="7", inviter_username="player", inviter_avatar_url=None,
    )
    assert invitation.room_code == "ABC123"
    assert invitation.inviter_id == "7"


def test_realtime_delivery_is_recipient_scoped():
    async def scenario():
        connections = NotificationConnections()
        intended = _WebSocket()
        other = _WebSocket()
        await connections.connect(2, intended)
        await connections.connect(3, other)
        await connections.send(2, {"event": "ROOM_INVITATION", "data": {"room_code": "ABC123"}})
        return intended, other

    intended, other = asyncio.run(scenario())
    assert intended.accepted and other.accepted
    assert len(intended.messages) == 1
    assert other.messages == []
