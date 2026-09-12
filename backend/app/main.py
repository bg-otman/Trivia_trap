from fastapi import FastAPI
from engine.room_manager import router as room_manager
from engine.room_manager import get_available_rooms
from pydantic import BaseModel, SecretStr

app = FastAPI()

app.include_router(room_manager)

class RegisterData(BaseModel):
    email : str
    username : str
    password : SecretStr

@app.post("/auth/register", status_code=201)
def register(data: RegisterData):
    # print(data.username)
    # print(data.email)
    # print(data.password.get_secret_value())
    # Next: validate the fields, check for an existing account,
    # hash the password, and save the user in the database.
    return{"message": "Registration endpoint received the data"}

@app.get("/")
def root():
    return { "message": "HELLO WORLD! THIS IS THE HOME PAGE :)" }

@app.get("/rooms")
def get_rooms():
    return get_available_rooms()