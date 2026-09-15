"""Temporary development storage, reset on reload and separate per worker."""

from typing import NotRequired, TypedDict


class StoredUser(TypedDict):
    id: int
    username: str
    email: str
    # The original lookup-only fixture has no password hash.
    password_hash: NotRequired[str]


TEST_USERS: list[StoredUser] = [
    {"id": 1, "username": "Aleeeeeex123", "email": "alex@example.com"},
]


class DuplicateUserError(Exception):
    pass

#check existing user by username or email and handle the 
def find_existing_user_id(username: str, email: str) -> int | None:
    username_key = username.casefold()
    email_key = email.casefold()

    for user in TEST_USERS:
        if (
            user["username"].casefold() == username_key
            or user["email"].casefold() == email_key
        ):
            return user["id"]

    return None


def create_user(username: str, email: str, password_hash: str) -> StoredUser:
    # No await between checking and inserting: atomic on this event loop.
    # PostgreSQL will need unique constraints and conflict handling instead.
    if find_existing_user_id(username, email) is not None:
        raise DuplicateUserError

    user: StoredUser = {
        "id": max((user["id"] for user in TEST_USERS), default=0) + 1,
        "username": username,
        "email": email,
        "password_hash": password_hash,
    }
    TEST_USERS.append(user)
    return user
