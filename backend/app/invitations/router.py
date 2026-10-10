from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status

from authentication.current_user import get_current_user, get_current_user_ws
from authentication.repository import DbSession
from dataProcessing.models import User
from engine.room_manager import manager
from engine.room_models import RoomPhase
from presence import mark_user_online
from .realtime import notification_connections
from .repository import create_invitation, get_pending_invitation, list_invitations, serialize, set_status
from .schemas import AcceptInvitationResponse, InvitationResponse, SendInvitation

router = APIRouter(prefix="/invitations", tags=["Invitations"])
CurrentUser = Annotated[User, Depends(get_current_user)]


def get_open_room(room_code: str):
    room = manager.rooms.get(room_code)
    if room is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Room not found")
    if room.meta_data.phase.current_state != RoomPhase.LOBBY:
        raise HTTPException(status.HTTP_409_CONFLICT, "This game has already started")
    if len(room.players) >= room.meta_data.settings.max_players:
        raise HTTPException(status.HTTP_409_CONFLICT, "This room is full")
    return room


@router.get("", response_model=list[InvitationResponse])
async def incoming_invitations(current_user: CurrentUser, db: DbSession):
    return await list_invitations(db, current_user.id)


@router.post("", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def send_invitation(payload: SendInvitation, current_user: CurrentUser, db: DbSession):
    room_code = payload.room_code.upper()
    room = get_open_room(room_code)
    if not any(player.db_user_id == current_user.id for player in room.players.values()):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You must be in this room to invite friends")
    if any(player.db_user_id == payload.recipient_id for player in room.players.values()):
        raise HTTPException(status.HTTP_409_CONFLICT, "This friend is already in the room")
    try:
        invitation = await create_invitation(db, current_user.id, payload.recipient_id, room_code)
    except ValueError as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error)) from error
    response = serialize(invitation, current_user)
    await notification_connections.send(payload.recipient_id, {
        "event": "ROOM_INVITATION",
        "data": InvitationResponse.model_validate(response).model_dump(mode="json"),
    })
    return response


@router.post("/{invitation_id}/accept", response_model=AcceptInvitationResponse)
async def accept_invitation(invitation_id: UUID, current_user: CurrentUser, db: DbSession):
    try:
        invitation = await get_pending_invitation(db, invitation_id, current_user.id)
    except ValueError as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    room = get_open_room(invitation.room_code)
    if any(player.db_user_id == current_user.id for player in room.players.values()):
        await set_status(db, invitation, "accepted")
        return {"room_code": invitation.room_code}
    await set_status(db, invitation, "accepted")
    return {"room_code": invitation.room_code}


@router.post("/{invitation_id}/decline", status_code=status.HTTP_204_NO_CONTENT)
async def decline_invitation(invitation_id: UUID, current_user: CurrentUser, db: DbSession) -> None:
    try:
        invitation = await get_pending_invitation(db, invitation_id, current_user.id)
    except ValueError as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    await set_status(db, invitation, "declined")


@router.websocket("/ws")
async def invitation_socket(websocket: WebSocket, user: Annotated[User, Depends(get_current_user_ws)]):
    await notification_connections.connect(user.id, websocket)
    mark_user_online(user.id)
    try:
        while True:
            await websocket.receive_text()
            mark_user_online(user.id)
    except WebSocketDisconnect:
        pass
    finally:
        notification_connections.disconnect(user.id, websocket)
