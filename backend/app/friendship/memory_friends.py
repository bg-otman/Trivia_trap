from authentication.memory_store import find_user_by_id

friendships: set[frozenset[str]] = set()

pending_requests: set[tuple[str, str]] = set()


def get_friends(user_id: str) -> list[dict[str, str]]:
    result = []

    for pair in friendships:
        if user_id not in pair:
            continue

        for friend_id in pair:
            if friend_id == user_id:
                continue

            user = find_user_by_id(friend_id)
            if user is not None:
                result.append({"id": user["id"], "username": user["username"]})

    return result


def send_friend(from_user_id: str, to_user_id: str):
    if from_user_id == to_user_id:
        raise ValueError("You cannot send yourself a friend request")

    if find_user_by_id(to_user_id) is None:
        raise ValueError("User not found")

    if frozenset({from_user_id, to_user_id}) in friendships:
        raise ValueError("Already friends")

    if (from_user_id, to_user_id) in pending_requests:
        raise ValueError("Friend request already sent")

    if (to_user_id, from_user_id) in pending_requests:
        raise ValueError("This user already sent you a friend request")

    pending_requests.add((from_user_id, to_user_id))


def accept_request(receiver_id: str, sender_id: str):
    request = (sender_id, receiver_id)

    if request not in pending_requests:
        raise ValueError("Friend request not found")

    if find_user_by_id(sender_id) is None:
        pending_requests.remove(request)
        raise ValueError("User not found")

    pending_requests.remove(request)
    friendships.add(frozenset({sender_id, receiver_id}))


def get_incoming_requests(user_id: str) -> list[dict[str, str]]:
    result = []

    for sender_id, receiver_id in pending_requests:
        if receiver_id != user_id:
            continue

        sender = find_user_by_id(sender_id)
        if sender is not None:
            result.append({
                "id": sender["id"],
                "username": sender["username"],
            })

    return result


def reject_request(receiver_id: str, sender_id: str):
    request = (sender_id, receiver_id)

    if request not in pending_requests:
        raise ValueError("Friend request not found")

    pending_requests.remove(request)

def cancel_request(sender_id: str, receiver_id: str):
    request = (sender_id, receiver_id)

    if request not in pending_requests:
        raise ValueError("Friend request not found")

    pending_requests.remove(request)


def remove_friend(user_id: str, friend_id: str):
    pair = frozenset({user_id, friend_id})

    if pair not in friendships:
        raise ValueError("You are not friends")

    friendships.remove(pair)

