from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from engine.room_manager import router as room_router
from engine.room_manager import get_available_rooms
from users.router import router as user_router
from authentication.router import auth_router
from authentication.session_cookie import ALLOWED_BROWSER_ORIGINS
from dataProcessing.database import engine

# from friendship.router import friends_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_BROWSER_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(room_router)
app.include_router(user_router)
app.include_router(auth_router)
# app.include_router(friends_router)


@app.get("/rooms")
def get_rooms():
    return get_available_rooms()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready():
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return {"status": "ready", "database": "ok"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")