from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"]) # i need to do global dependency injection for the current user

@router.get("/me")
def get_profile():
    return {"Profile"}

