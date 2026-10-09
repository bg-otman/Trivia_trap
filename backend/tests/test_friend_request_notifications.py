import asyncio
from datetime import datetime, timezone

from friendship.repository import get_incoming_requests
from friendship.schemas import IncomingFriendRequest


class _Rows:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class _Session:
    def __init__(self, rows):
        self.rows = rows

    async def execute(self, _statement):
        return _Rows(self.rows)


def test_incoming_requests_include_persisted_timestamp():
    created_at = datetime(2026, 10, 9, 12, 30, tzinfo=timezone.utc)
    session = _Session([(7, "challenger", "/uploads/7_avatar.png", created_at)])

    requests = asyncio.run(get_incoming_requests(session, user_id=12))

    assert requests == [{
        "id": "7",
        "username": "challenger",
        "avatar_url": "/uploads/7_avatar.png",
        "created_at": "2026-10-09T12:30:00+00:00",
    }]
    parsed = IncomingFriendRequest.model_validate(requests[0])
    assert parsed.created_at == created_at


def test_incoming_request_allows_missing_avatar():
    request = IncomingFriendRequest(
        id="8",
        username="no_avatar",
        avatar_url=None,
        created_at=datetime.now(timezone.utc),
    )

    assert request.avatar_url is None
