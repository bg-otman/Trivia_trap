import asyncio

from fastapi import WebSocket

from engine.events import submit_bluff, submit_vote
from engine.room_models import PlayerInfo, Room, RoomMetaData, RoomPhase, RoomSettings
from engine.utils import Context


def fake_websocket():
    async def receive():
        return {"type": "websocket.receive", "text": "{}"}

    async def send(_message):
        return None

    return WebSocket({"type": "websocket"}, receive, send)


class ProbeManager:
    def __init__(self, room):
        self.rooms = {"room": room}
        self.broadcasts = []

    async def broadcast(self, data, room_id, exclude=None):
        self.broadcasts.append((data, room_id, exclude))


def player(name):
    return PlayerInfo(ws=fake_websocket(), name=name)


def context(player_id, data):
    return Context(
        room_id="room",
        user_id=player_id,
        user_name=player_id,
        data=data,
    )


def test_bluff_confirmation_is_broadcast_to_the_room():
    async def scenario():
        phase = RoomPhase()
        phase.start()
        phase.cycle()
        room = Room(
            meta_data=RoomMetaData(
                host_id="p1",
                settings=RoomSettings(),
                phase=phase,
                correct_answer="Truth",
            ),
            players={"p1": player("p1"), "p2": player("p2")},
        )
        manager = ProbeManager(room)

        await submit_bluff(manager, context("p1", {"bluff_answer": "Decoy"}))

        assert manager.broadcasts == [(
            {"event": "BLUFF_SUBMITTED", "data": {"player_id": "p1"}},
            "room",
            None,
        )]

    asyncio.run(scenario())


def test_vote_confirmation_is_broadcast_to_the_room():
    async def scenario():
        phase = RoomPhase()
        phase.start()
        phase.cycle()
        phase.cycle()
        room = Room(
            meta_data=RoomMetaData(
                host_id="p1",
                settings=RoomSettings(),
                phase=phase,
                voting_choices=[
                    {"id": "truth", "text": "Truth", "author_ids": [], "is_correct": True},
                ],
            ),
            players={"p1": player("p1"), "p2": player("p2")},
        )
        manager = ProbeManager(room)

        await submit_vote(manager, context("p1", {"choice_id": "truth"}))

        assert manager.broadcasts == [(
            {"event": "VOTE_SUBMITTED", "data": {"player_id": "p1"}},
            "room",
            None,
        )]

    asyncio.run(scenario())
