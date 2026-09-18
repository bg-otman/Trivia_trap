"""Temporary development storage. Users disappear on server restart."""

from typing import NotRequired, TypedDict
from uuid import uuid4


class StoredUser(TypedDict):
    id: str
    username: str
    email: str
    # add google auth 
    password_hash: NotRequired[str | None]


TEST_USERS: list[StoredUser] = [] #hardcoded users for testing purposes. In production, use a database or persistent storage.


class DuplicateUserError(Exception):
    pass


def find_existing_user_id(username: str, email: str,) -> str | None:
    for user in TEST_USERS:
        if (user["username"].casefold() == username.casefold()
            or user["email"].casefold() == email.casefold()):

            return user["id"]

    return None


def find_user_by_email(email: str) -> StoredUser | None:
    for user in TEST_USERS:
        if user["email"].casefold() == email.casefold():
            return user

    return None


def find_user_by_id(user_id: str) -> StoredUser | None:
    for user in TEST_USERS:
        if user["id"] == user_id:
            return user

    return None


def create_user(username: str, email: str, password_hash: str,) -> StoredUser:
    if find_existing_user_id(username, email) is not None:
        raise DuplicateUserError

    user: StoredUser = {
        "id": str(uuid4()),
        "username": username,
        "email": email,
        "password_hash": password_hash,
    }

    TEST_USERS.append(user)
    return user
