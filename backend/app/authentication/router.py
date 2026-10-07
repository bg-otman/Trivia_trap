from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.concurrency import run_in_threadpool
from authentication.repository import DuplicateUserError, create_user, find_existing_user_id
from authentication.schemas import RegisterData, UserResponse
from authentication.security import hash_password
from authentication.validation_route import AuthRoute
from authentication.schemas import LoginData, TokenResponse
from authentication.security import create_access_token, authenticate_user
from authentication.session_cookie import set_access_cookie
from typing import Annotated

from authentication.current_user import get_current_user
from authentication.google_auth import google_router
from authentication.password_reset import reset_router
from dataProcessing.models import User
from authentication.repository import DbSession


auth_router = APIRouter(prefix="/auth", tags=["AUTH"], route_class=AuthRoute)
DUPLICATE_USER_MESSAGE = "Username or email is already registered."

auth_router.include_router(google_router)
auth_router.include_router(reset_router)

@auth_router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserResponse,
)
async def register(data: RegisterData, db: DbSession) -> UserResponse:
    if await find_existing_user_id(db, data.username, data.email) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_USER_MESSAGE)

    password_hash = await run_in_threadpool(
        hash_password,
        data.password.get_secret_value(),
    )
    try:
        user = await create_user(db, data.username, data.email, password_hash)
    except DuplicateUserError:
        raise HTTPException(status.HTTP_409_CONFLICT, DUPLICATE_USER_MESSAGE) from None

    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
    )


@auth_router.post("/login", response_model=TokenResponse)
async def login(data: LoginData, db: DbSession, request: Request, response: Response) -> TokenResponse:
    user = await authenticate_user(
        db, data.email,
        data.password.get_secret_value(),
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(user.id, user.auth_version)
    set_access_cookie(response, request, access_token)

    return TokenResponse(access_token=access_token)


@auth_router.get("/me", response_model=UserResponse)
async def me(user: Annotated[User, Depends(get_current_user)],) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        username=user.username,
        email=user.email,
    )
