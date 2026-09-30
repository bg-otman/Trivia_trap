from fastapi import FastAPI
from engine.room_manager import router as room_manager
from engine.room_manager import get_available_rooms
from users.router import router as user_router

app = FastAPI()

app.include_router(room_manager)
app.include_router(user_router)

@app.get("/")
def root():
    return { "message": "HELLO WORLD! THIS IS THE HOME PAGE :)" }

@app.get("/rooms")
def get_rooms():
    return get_available_rooms()