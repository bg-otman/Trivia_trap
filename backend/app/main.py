from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from engine.room_manager import router as room_manager
from engine.room_manager import get_available_rooms
from dataProcessing.database import engine

app = FastAPI()

app.include_router(room_manager)


@app.get("/")
def root():
    return {"message": "HELLO WORLD! THIS IS THE HOME PAGE :)"}


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
