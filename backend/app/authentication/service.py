from starlette.concurrency import run_in_threadpool

from authentication.memory_store import (
    StoredUser,
    find_user_by_email,
)
from authentication.security import hash_password, verify_password


DUMMY_PASSWORD_HASH = hash_password("DummyPassword123!ThisIsNeverARealAccount")


async def authenticate_user(email: str, password: str,) -> StoredUser | None:

    user = find_user_by_email(email)
    password_hash = user.get("password_hash") if user is not None else None

    password_matches = await run_in_threadpool(
        verify_password,
        password,
        password_hash or DUMMY_PASSWORD_HASH,
    )

    if user is None or not password_hash or not password_matches:
        return None

    return user
