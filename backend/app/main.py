from fastapi import FastAPI
from engine.room_manager import router as room_router
from engine.room_manager import get_available_rooms
from users.router import router as user_router
from fastapi.middleware.cors import CORSMiddleware
from authentication.router import auth_router
from friendship.router import friends_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(room_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(friends_router)

@app.get("/")
def root():
    return { "branch ta3 sbe3: 'H0MZ0'" }

@app.get("/rooms")
def get_rooms():
    return get_available_rooms()