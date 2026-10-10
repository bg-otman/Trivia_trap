"""Process-local authenticated presence with automatic expiry."""

from time import monotonic


PRESENCE_TTL_SECONDS = 75
_last_seen: dict[int, float] = {}


def mark_user_online(user_id: int, *, now: float | None = None) -> None:
    _last_seen[user_id] = monotonic() if now is None else now


def mark_user_offline(user_id: int) -> None:
    _last_seen.pop(user_id, None)


def is_user_online(user_id: int, *, now: float | None = None) -> bool:
    seen_at = _last_seen.get(user_id)
    if seen_at is None:
        return False
    current = monotonic() if now is None else now
    if current - seen_at >= PRESENCE_TTL_SECONDS:
        _last_seen.pop(user_id, None)
        return False
    return True
