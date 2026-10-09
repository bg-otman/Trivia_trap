from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import and_, or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from dataProcessing.models import Friendship, RoomInvitation, User

INVITATION_TTL = timedelta(hours=2)


async def are_friends(db: AsyncSession, first: int, second: int) -> bool:
    return bool(await db.scalar(select(Friendship.requester_id).where(
        Friendship.status == "accepted",
        or_(
            and_(Friendship.requester_id == first, Friendship.receiver_id == second),
            and_(Friendship.requester_id == second, Friendship.receiver_id == first),
        ),
    )))


async def create_invitation(db: AsyncSession, sender_id: int, recipient_id: int, room_code: str) -> RoomInvitation:
    if sender_id == recipient_id or not await are_friends(db, sender_id, recipient_id):
        raise ValueError("You can only invite an accepted friend")
    invitation = RoomInvitation(
        sender_id=sender_id, recipient_id=recipient_id, room_code=room_code,
        expires_at=datetime.now(timezone.utc) + INVITATION_TTL,
    )
    db.add(invitation)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise ValueError("This friend has already been invited") from error
    await db.refresh(invitation)
    return invitation


async def list_invitations(db: AsyncSession, recipient_id: int) -> list[dict]:
    now = datetime.now(timezone.utc)
    await db.execute(update(RoomInvitation).where(
        RoomInvitation.recipient_id == recipient_id,
        RoomInvitation.status == "pending",
        RoomInvitation.expires_at <= now,
    ).values(status="expired"))
    await db.commit()
    rows = (await db.execute(select(RoomInvitation, User).join(
        User, User.id == RoomInvitation.sender_id,
    ).where(
        RoomInvitation.recipient_id == recipient_id,
        RoomInvitation.status == "pending",
        RoomInvitation.expires_at > now,
    ).order_by(RoomInvitation.created_at.desc()))).all()
    return [serialize(invitation, sender) for invitation, sender in rows]


async def get_pending_invitation(db: AsyncSession, invitation_id: UUID, recipient_id: int) -> RoomInvitation:
    invitation = await db.scalar(select(RoomInvitation).where(
        RoomInvitation.id == invitation_id,
        RoomInvitation.recipient_id == recipient_id,
        RoomInvitation.status == "pending",
    ))
    if invitation is None:
        raise ValueError("Invitation not found")
    if invitation.expires_at <= datetime.now(timezone.utc):
        invitation.status = "expired"
        await db.commit()
        raise ValueError("Invitation has expired")
    return invitation


async def set_status(db: AsyncSession, invitation: RoomInvitation, status: str) -> None:
    invitation.status = status
    await db.commit()


def serialize(invitation: RoomInvitation, sender: User) -> dict:
    return {
        "id": invitation.id, "room_code": invitation.room_code, "status": invitation.status,
        "created_at": invitation.created_at, "expires_at": invitation.expires_at,
        "inviter_id": str(sender.id), "inviter_username": sender.username,
        "inviter_avatar_url": sender.avatar_url,
    }
