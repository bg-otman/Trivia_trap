from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError

from authentication.repository import DbSession, find_user_by_id
from dataProcessing.models import User
from authentication.security import decode_access_token


bearer_scheme = HTTPBearer(auto_error=False)


def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: DbSession,
) -> User:
    if credentials is None:
        raise unauthorized()

    try:
        user_id, version = decode_access_token(credentials.credentials)
    except InvalidTokenError:
        raise unauthorized() from None

    user = await find_user_by_id(db, user_id)

    if user is None or user.auth_version != version:
        raise unauthorized()

    return user
