from typing import Annotated

from friendship import memory_friends
from fastapi import APIRouter, Depends, HTTPException
from authentication.current_user import get_current_user
from authentication.memory_store import StoredUser
from friendship.memory_friends import get_friends, send_friend, accept_request, get_incoming_requests, reject_request, cancel_request

friends_router = APIRouter(prefix="/friends", tags=["Friendship"])

CurrentUser = Annotated[StoredUser, Depends(get_current_user)]


@friends_router.get("/")
async def list_friends(current_user: CurrentUser):
    return get_friends(current_user["id"])


@friends_router.post("/request/{user_id}")
async def send_friend_request(user_id: str, current_user: CurrentUser):
    try:
        send_friend(current_user["id"], user_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"message": "Friend request sent"}

@friends_router.post("/accept/{sender_id}")
async def accept_friend_request(sender_id: str, current_user: CurrentUser):
    try:
        accept_request(current_user["id"], sender_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"message": "Friend request accepted"}


@friends_router.get("/requests")
async def list_incoming_requests(current_user: CurrentUser):
    return get_incoming_requests(current_user["id"])


@friends_router.post("/reject/{sender_id}")
async def reject_friend_request(sender_id: str, current_user: CurrentUser):
    try:
        reject_request(current_user["id"], sender_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"message": "Friend request rejected"}

@friends_router.delete("/request/{receiver_id}")
async def cancel_friend_request(
    receiver_id: str,
    current_user: CurrentUser,
):
    try:
        cancel_request(current_user["id"], receiver_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"message": "Friend request canceled"}


@friends_router.delete("/{friend_id}")
async def remove_friend(friend_id: str, current_user: CurrentUser):
    try:
        memory_friends.remove_friend(current_user["id"], friend_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {"message": "Friend removed"}
