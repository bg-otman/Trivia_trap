"""Isolated ASGI application: only external authentication is replaced."""
import os
from types import SimpleNamespace

from fastapi import FastAPI, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.engine import make_url
from starlette.datastructures import Headers

from dataProcessing import services
from dataProcessing.models import User, UserAchievement
from engine.room_manager import router

# Public test credentials, deliberately unrelated to production credentials.
TOKENS = {f"lab-player-{uid}": uid for uid in range(101, 106)}


def require_test_database(url):
    parsed = make_url(url)
    if parsed.host not in {"localhost", "127.0.0.1"} or parsed.database != "achievement_test_lab":
        raise RuntimeError("The lab requires the separate loopback achievement_test_lab database")


class TestIdentity:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] in {"http", "websocket"}:
            header = Headers(scope=scope).get("authorization", "")
            uid = TOKENS.get(header.removeprefix("Bearer ")) if header.startswith("Bearer ") else None
            # Never use query parameters, request bodies, usernames, or client IDs.
            scope = {**scope, "user": SimpleNamespace(is_authenticated=uid is not None, user_id=uid)}
        await self.app(scope, receive, send)


def create_app():
    application = FastAPI(title="Local achievement lab (test identity only)")
    application.include_router(router)  # the actual game router
    application.add_middleware(TestIdentity)

    @application.get("/test/profile")
    async def profile(request: Request):
        principal = request.scope["user"]
        if not principal.is_authenticated:
            raise HTTPException(401, "Invalid test token")
        async with services.AsyncSessionLocal() as session:
            user = await session.get(User, principal.user_id)
            if user is None:
                raise HTTPException(401, "Test account does not exist")
            codes = (await session.scalars(select(UserAchievement.achievement_code).where(
                UserAchievement.user_id == user.id).order_by(UserAchievement.achievement_code))).all()
            return {"user_id": user.id, "username": user.username, "achievements": codes,
                    "history": await services.get_user_history(session, user.id)}

    return application


def local_app():
    """Uvicorn --factory entry point; regular main.py has no test middleware."""
    if os.environ.get("ACHIEVEMENT_LAB") != "1":
        raise RuntimeError("Start this application using scripts/achievement_lab.sh")
    require_test_database(os.environ["DATABASE_URL"])
    return create_app()
