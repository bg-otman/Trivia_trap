from fastapi import FastAPI
from engine.room_manager import router as room_manager
from engine.room_manager import get_available_rooms
from authentication.router import auth_router
from friendship.router import friends_router


app = FastAPI()

app.include_router(room_manager)
app.include_router(auth_router)
app.include_router(friends_router)

@app.get("/")
def root():
    return { "message": "HELLO WORLD! THIS IS THE HOME PAGE :)" }

@app.get("/rooms")
def get_rooms():
    return get_available_rooms()
