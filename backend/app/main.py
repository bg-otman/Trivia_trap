from fastapi import FastAPI
from engine.room_manager import router as room_manager

app = FastAPI()

app.include_router(room_manager)

@app.get("/")
def root():
    return "HELLO WORLD! THIS IS THE HOME PAGE :)"