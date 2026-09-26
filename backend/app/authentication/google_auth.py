import os
from uuid import uuid4
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, SecretStr

from authentication.schemas import TokenResponse
from authentication.memory_store import (
    DuplicateUserError,
    create_user,
    find_existing_user_id,
    find_user_by_email,
    find_user_by_google_sub,
)
from authentication.security import create_access_token
from authentication.validation_route import AuthRoute

from google.auth.exceptions import GoogleAuthError, TransportError
from google.auth.transport.requests import Request
from google.oauth2 import id_token
from fastapi.concurrency import run_in_threadpool

google_router = APIRouter(route_class=AuthRoute)


class GoogleLoginData(BaseModel):
    credential: SecretStr = Field(min_length=1)


@google_router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleLoginData) -> TokenResponse:
    claims = await run_in_threadpool(
        verify_google_token,
        data.credential.get_secret_value(),
    )

    google_sub = claims.get("sub")
    if not isinstance(google_sub, str) or not google_sub:
        raise HTTPException(status_code=401, detail="Invalid Google identity.")

    user = find_user_by_google_sub(google_sub)
    if user is None:
        email = claims.get("email")
        if not isinstance(email, str) or not email or claims.get("email_verified") is not True:
            raise HTTPException(status_code=401, detail="A verified Google email is required.")

        if find_user_by_email(email) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists. Sign in with your existing method.",
            )

        # Generate a valid, unique username within the existing 15-character limit.
        username = "Player" + uuid4().hex[:9]
        while find_existing_user_id(username, email) is not None:
            username = "Player" + uuid4().hex[:9]

        try:
            user = create_user(username, email, None, google_sub=google_sub)
        except DuplicateUserError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this identity already exists.",
            ) from None

    return TokenResponse(
        access_token=create_access_token(user["id"]),
    )


def verify_google_token(credential: str) -> dict:
    client_id = os.environ.get("GOOGLE_CLIENT_ID")

    if not client_id:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured.",
        )

    try:
        return id_token.verify_oauth2_token(
            credential,
            Request(),
            audience=client_id,
        )
    except TransportError:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is temporarily unavailable.",
        ) from None
    except (ValueError, GoogleAuthError):
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token.",
        ) from None
