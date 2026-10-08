import os
import re
import unicodedata
from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, Field, SecretStr

from authentication.schemas import TokenResponse
from authentication.repository import (
    DbSession,
    find_user_by_username,
    DuplicateUserError,
    create_user,
    find_user_by_email,
    find_user_by_google_sub,
)
from authentication.security import create_access_token
from authentication.session_cookie import set_access_cookie
from authentication.validation_route import AuthRoute

from google.auth.exceptions import GoogleAuthError, TransportError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
from fastapi.concurrency import run_in_threadpool

google_router = APIRouter(route_class=AuthRoute)
LEGACY_GOOGLE_USERNAME = re.compile(r"^Player[0-9a-f]{9}$")


class GoogleLoginData(BaseModel):
    credential: SecretStr = Field(min_length=1)


def google_username_base(claims: dict) -> str:
    """Build a valid account name from Google's verified profile claims."""
    candidate = claims.get("name") or claims.get("given_name") or ""
    normalized = unicodedata.normalize("NFKD", candidate)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
    username = "".join(character for character in ascii_name if character.isalnum())
    if not username or not username[0].isalpha():
        username = "Player"
    return username[:15]


async def unique_google_username(db: DbSession, claims: dict, *, current_user_id: int | None = None) -> str:
    base = google_username_base(claims)
    candidate = base
    suffix = 1
    while True:
        existing = await find_user_by_username(db, candidate)
        if existing is None or existing.id == current_user_id:
            return candidate
        suffix_text = str(suffix)
        candidate = f"{base[:15 - len(suffix_text)]}{suffix_text}"
        suffix += 1


@google_router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleLoginData, db: DbSession, request: Request, response: Response) -> TokenResponse:
    claims = await run_in_threadpool(
        verify_google_token,
        data.credential.get_secret_value(),
    )

    google_sub = claims.get("sub")
    if not isinstance(google_sub, str) or not google_sub or len(google_sub) > 255:
        raise HTTPException(status_code=401, detail="Invalid Google identity.")

    user = await find_user_by_google_sub(db, google_sub)
    if user is None:
        email = claims.get("email")
        if not isinstance(email, str) or not email or len(email) > 255 or claims.get("email_verified") is not True:
            raise HTTPException(status_code=401, detail="A verified Google email is required.")

        if await find_user_by_email(db, email) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists. Sign in with your existing method.",
            )

        username = await unique_google_username(db, claims)

        try:
            user = await create_user(db, username, email, None, google_sub=google_sub)
        except DuplicateUserError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An ac count with this identity already exists.",
            ) from None
    elif LEGACY_GOOGLE_USERNAME.fullmatch(user.username):
        # Accounts created by the old flow had random Playerxxxxxxxxx names.
        # Replace that placeholder once with the verified Google profile name.
        user.username = await unique_google_username(db, claims, current_user_id=user.id)
        await db.commit()

    access_token = create_access_token(user.id, user.auth_version)
    set_access_cookie(response, request, access_token)
    return TokenResponse(access_token=access_token)


def verify_google_token(credential: str) -> dict:
    client_id = os.environ.get("GOOGLE_CLIENT_ID")

    # Check if the Google Client ID is available in the environment variables.
    if not client_id:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured.",
        )

    try:
        return id_token.verify_oauth2_token(
            credential,
            GoogleRequest(),
            audience=client_id,
        )
    except TransportError: #google problem
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is temporarily unavailable.",
        ) from None
    except (ValueError, GoogleAuthError): #invalid token
        raise HTTPException(
            status_code=401,
            detail="Invalid Google token.",
        ) from None
