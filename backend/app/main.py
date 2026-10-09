from fastapi import FastAPI
from engine.room_manager import router as room_router
from engine.room_manager import get_available_rooms
from users.router import router as user_router
from fastapi.middleware.cors import CORSMiddleware
from authentication.router import auth_router
from authentication.session_cookie import ALLOWED_BROWSER_ORIGINS
from friendship.router import friends_router
from invitations.router import router as invitations_router
from fastapi.staticfiles import StaticFiles
from pathlib import Path


app = FastAPI()
uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

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
app.include_router(friends_router)
app.include_router(invitations_router)


@app.get("/rooms")
def get_rooms():
    return get_available_rooms()
