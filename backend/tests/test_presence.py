from presence import (
    PRESENCE_TTL_SECONDS,
    is_user_online,
    mark_user_offline,
    mark_user_online,
)


def test_presence_is_online_until_ttl_expires():
    mark_user_online(101, now=10.0)

    assert is_user_online(101, now=10.0 + PRESENCE_TTL_SECONDS - 0.1) is True
    assert is_user_online(101, now=10.0 + PRESENCE_TTL_SECONDS) is False


def test_presence_can_be_cleared_on_logout():
    mark_user_online(202, now=20.0)
    mark_user_offline(202)

    assert is_user_online(202, now=20.1) is False
