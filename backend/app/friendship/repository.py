"""Persistent friendship operations, scoped to the authenticated user."""
from sqlalchemy import and_, case, delete, func, or_, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from authentication.repository import find_user_by_id
from dataProcessing.models import Friendship, User
from presence import is_user_online


def user_pair(first: int, second: int):
    return or_(
        and_(Friendship.requester_id == first, Friendship.receiver_id == second),
        and_(Friendship.requester_id == second, Friendship.receiver_id == first),
    )


async def search_players(db: AsyncSession, current_user_id: int, prefix: str) -> list[dict[str, str | None]]:
    normalized_prefix = prefix.casefold()
    rows = (await db.execute(
        select(User.id, User.username, User.avatar_url).where(
            User.id != current_user_id,
            User.username_key.like(f"{normalized_prefix}%"),
        ).order_by(User.username_key, User.id).limit(10)
    )).all()
    return [{"id": str(user_id), "username": username, "avatar_url": avatar_url} for user_id, username, avatar_url in rows]


async def get_friends(db: AsyncSession, user_id: int) -> list[dict[str, str | bool | None]]:
    other_id = case(
        (Friendship.requester_id == user_id, Friendship.receiver_id),
        else_=Friendship.requester_id,
    )
    users = await db.scalars(
        select(User).join(Friendship, User.id == other_id).where(
            Friendship.status == "accepted",
            or_(Friendship.requester_id == user_id, Friendship.receiver_id == user_id),
        ).order_by(User.id)
    )
    return [{
        "id": str(user.id),
        "username": user.username,
        "avatar_url": user.avatar_url,
        "is_online": is_user_online(user.id),
    } for user in users]


async def send_friend(db: AsyncSession, from_user_id: int, to_user_id: int):
    if from_user_id == to_user_id:
        raise ValueError("You cannot send yourself a friend request")
    if await find_user_by_id(db, to_user_id) is None:
        raise ValueError("User not found")

    # The existing unordered-pair unique index prevents simultaneous A→B/B→A
    # requests. Previously rejected rows may be reused in either direction.
    statement = insert(Friendship).values(
        requester_id=from_user_id, receiver_id=to_user_id, status="pending",
    ).on_conflict_do_update(
        index_elements=[
            func.least(Friendship.requester_id, Friendship.receiver_id),
            func.greatest(Friendship.requester_id, Friendship.receiver_id),
        ],
        set_={"requester_id": from_user_id, "receiver_id": to_user_id,
              "status": "pending", "created_at": func.now()},
        where=Friendship.status == "rejected",
    ).returning(Friendship.requester_id)
    try:
        created = await db.scalar(statement)
        if created is not None:
            await db.commit()
            return
        existing = (await db.execute(select(
            Friendship.requester_id, Friendship.status,
        ).where(user_pair(from_user_id, to_user_id)))).first()
        await db.rollback()
    except IntegrityError as exc:
        await db.rollback()
        if getattr(exc.orig, "sqlstate", None) == "23503":
            raise ValueError("User not found") from exc
        raise

    if existing is not None and existing.status == "accepted":
        raise ValueError("Already friends")
    if existing is not None and existing.requester_id != from_user_id:
        raise ValueError("This user already sent you a friend request")
    raise ValueError("Friend request already sent")


async def accept_request(db: AsyncSession, receiver_id: int, sender_id: int):
    changed = await db.scalar(update(Friendship).where(
        Friendship.requester_id == sender_id,
        Friendship.receiver_id == receiver_id,
        Friendship.status == "pending",
    ).values(status="accepted").returning(Friendship.requester_id))
    if changed is None:
        await db.rollback()
        raise ValueError("Friend request not found")
    await db.commit()


async def get_incoming_requests(db: AsyncSession, user_id: int) -> list[dict[str, str | None]]:
    rows = (await db.execute(select(
        User.id, User.username, User.avatar_url, Friendship.created_at,
    ).join(
        Friendship, Friendship.requester_id == User.id,
    ).where(
        Friendship.receiver_id == user_id, Friendship.status == "pending",
    ).order_by(Friendship.created_at.desc(), User.id))).all()
    return [{
        "id": str(user_id),
        "username": username,
        "avatar_url": avatar_url,
        "created_at": created_at.isoformat(),
    } for user_id, username, avatar_url, created_at in rows]


async def get_sent_requests(db: AsyncSession, user_id: int) -> list[dict[str, str | None]]:
    users = await db.scalars(select(User).join(
        Friendship, Friendship.receiver_id == User.id,
    ).where(
        Friendship.requester_id == user_id, Friendship.status == "pending",
    ).order_by(User.id))
    return [{"id": str(user.id), "username": user.username, "avatar_url": user.avatar_url} for user in users]


async def reject_request(db: AsyncSession, receiver_id: int, sender_id: int):
    # Preserve the previous behavior: rejecting removes the request and allows
    # either player to send a new one later.
    await _delete_pending(db, sender_id, receiver_id)


async def cancel_request(db: AsyncSession, sender_id: int, receiver_id: int):
    await _delete_pending(db, sender_id, receiver_id)


async def _delete_pending(db: AsyncSession, sender_id: int, receiver_id: int):
    removed = await db.scalar(delete(Friendship).where(
        Friendship.requester_id == sender_id,
        Friendship.receiver_id == receiver_id,
        Friendship.status == "pending",
    ).returning(Friendship.requester_id))
    if removed is None:
        await db.rollback()
        raise ValueError("Friend request not found")
    await db.commit()


async def remove_friend(db: AsyncSession, user_id: int, friend_id: int):
    removed = await db.scalar(delete(Friendship).where(
        user_pair(user_id, friend_id), Friendship.status == "accepted",
    ).returning(Friendship.requester_id))
    if removed is None:
        await db.rollback()
        raise ValueError("You are not friends")
    await db.commit()
