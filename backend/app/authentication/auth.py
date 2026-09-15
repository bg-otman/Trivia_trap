from fastapi import APIRouter, HTTPException, status
from starlette.concurrency import run_in_threadpool
from authentication.memory_store import (DuplicateUserError, create_user, find_existing_user_id,)
from authentication.schemas import RegisterData, UserResponse
from authentication.security import hash_password
from authentication.routes import AuthRoute


auth_router = APIRouter(prefix="/auth", tags=["AUTH"], route_class=AuthRoute)
DUPLICATE_USER_MESSAGE = "Username or email is already registered."


@auth_router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserResponse,
)
async def register(data: RegisterData) -> UserResponse:
    if find_existing_user_id(data.username, data.email) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_USER_MESSAGE)

    password_hash = await run_in_threadpool(
        hash_password,
        data.password.get_secret_value(),
    )
    try:
        # Rechecks duplicates in case another request registered during hashing.
        user = create_user(data.username, data.email, password_hash)
    except DuplicateUserError:
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_USER_MESSAGE) from None

    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
    )
