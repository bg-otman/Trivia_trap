from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def root():
    return {"HELLO" : "WORLD"}

items = []

class Item(BaseModel):
    name: str
    description: str = "No description available"
    price: int

@app.post("/item")
def add_item(item: Item):
    items.append(item)

@app.get("/items/{id}")
def get_item(id: int):
    return {f"item with id : {id}" : items[id]}