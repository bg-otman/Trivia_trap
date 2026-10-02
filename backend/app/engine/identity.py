"""Bridge for the application's trusted ASGI authentication middleware.

No JWT/session verifier exists in this repository yet. Fail closed until an
upstream authentication backend supplies an authenticated principal in scope.
Client query parameters, headers and names are never accepted as identity.
"""
from dataclasses import dataclass
from fastapi import WebSocket, WebSocketException
from dataProcessing.database import AsyncSessionLocal
from dataProcessing.models import User


@dataclass(frozen=True)
class PlayerIdentity:
    user_id: int
    username: str

    @property
    def player_id(self) -> str:
        return str(self.user_id)


async def authenticated_player(ws: WebSocket) -> PlayerIdentity:
    principal = ws.scope.get("user")
    uid = getattr(principal, "user_id", None)
    if not getattr(principal, "is_authenticated", False) or type(uid) is not int or uid <= 0:
        raise WebSocketException(code=1008, reason="Authenticated session required")
    async with AsyncSessionLocal() as session:
        user = await session.get(User, uid)
        if user is None:
            raise WebSocketException(code=1008, reason="Unknown authenticated user")
        return PlayerIdentity(user_id=user.id, username=user.username)
