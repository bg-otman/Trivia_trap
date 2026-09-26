import os
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone
from uuid import UUID
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
from fastapi.concurrency import run_in_threadpool
from authentication.memory_store import StoredUser, find_user_by_email, find_user_by_id


JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is missing. Set it before starting the backend.")

password_hasher = PasswordHash.recommended() #password hashing and verification


def hash_password(password: str) -> str:
    return password_hasher.hash(password) #hash password


def verify_password(password: str, password_hash: str) -> bool: #check password in db
    try:
        return password_hasher.verify(password, password_hash)
    except UnknownHashError:
        return False


def create_access_token(user_id: str) -> str: #create JWT for user
    now = datetime.now(timezone.utc)

    payload = {
        "sub": user_id,
        "ver": (find_user_by_id(user_id) or {}).get("auth_version", 0),
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> str:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "iat", "exp"]},
        )
    except (TypeError, ValueError, OverflowError) as exc:
        raise InvalidTokenError("Invalid token claims") from exc

    for claim in ("iat", "exp", "nbf"):
        if claim in payload and type(payload[claim]) is not int:
            raise InvalidTokenError("Token timestamps must be integers")

    user_id = payload["sub"]

    if not isinstance(user_id, str):
        raise InvalidTokenError("Invalid user ID")

    try:
        UUID(user_id)
    except ValueError as exc:
        raise InvalidTokenError("Invalid user ID") from exc

    user = find_user_by_id(user_id)
    version = payload.get("ver", 0)
    if type(version) is not int or user is None or version != user.get("auth_version", 0):
        raise InvalidTokenError("Session expired")


    return user_id


DUMMY_PASSWORD_HASH = hash_password("DummyPassword123!ThisIsNeverARealAccount")

async def authenticate_user(email: str, password: str,) -> StoredUser | None:

    user = find_user_by_email(email)
    password_hash = user.get("password_hash") if user is not None else None
    auth_version = user.get("auth_version", 0) if user is not None else 0

    password_matches = await run_in_threadpool(
        verify_password,
        password,
        password_hash or DUMMY_PASSWORD_HASH,
    )

    if user is None or not password_hash or not password_matches:
        return None

    # A reset may finish while password verification runs in another thread.
    if user.get("password_hash") != password_hash or user.get("auth_version", 0) != auth_version:
        return None

    return user
