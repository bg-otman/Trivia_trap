from fastapi import FastAPI
from authentication.router import auth_router
from friendship.router import friends_router


app = FastAPI()

app.include_router(auth_router)
app.include_router(friends_router)

@app.get("/")
def root():
    return { "branch ta3 sbe3: 'H0MZ0'" }
