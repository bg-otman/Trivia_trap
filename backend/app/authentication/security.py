from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError

from authentication.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
)


password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password, password_hash)
    except UnknownHashError:
        return False


def create_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": user_id,
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
        # Some malformed date claims raise built-in exceptions in PyJWT.
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

    return user_id
