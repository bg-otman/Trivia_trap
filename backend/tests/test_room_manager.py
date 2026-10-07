import asyncio

from engine.room_manager import RoomManager
from engine.room_models import PlayerInfo, Room, RoomMetaData, RoomSettings


class FakeWebSocket:
    def __init__(self, *, fail=False):
        self.fail = fail
        self.closed = False
        self.sent = []

    async def send_json(self, data):
        if self.fail:
            raise RuntimeError("dead socket")
        self.sent.append(data)

    async def close(self):
        self.closed = True


def player(name, ws):
    return PlayerInfo.model_construct(
        ws=ws,
        name=name,
        score=0,
        is_present=True,
        avatar_url=None,
    )


def test_old_connection_cannot_mark_replacement_disconnected():
    async def scenario():
        manager = RoomManager()
        old_ws = FakeWebSocket()
        new_ws = FakeWebSocket()
        room = Room(
            meta_data=RoomMetaData(host_id="host", settings=RoomSettings()),
            players={"host": player("host", new_ws)},
        )
        manager.rooms["room"] = room
        marked = await manager.mark_disconnected("host", "room", old_ws)
        assert marked is False
        assert room.players["host"].is_present is True

    asyncio.run(scenario())


def test_host_disconnect_transfers_host_to_present_player():
    async def scenario():
        manager = RoomManager()
        host_ws = FakeWebSocket()
        other_ws = FakeWebSocket()
        room = Room(
            meta_data=RoomMetaData(host_id="host", settings=RoomSettings()),
            players={
                "host": player("host", host_ws),
                "p2": player("p2", other_ws),
            },
        )
        manager.rooms["room"] = room
        await manager.mark_disconnected("host", "room", host_ws)
        assert room.meta_data.host_id == "p2"

    asyncio.run(scenario())


def test_broadcast_failure_does_not_block_other_players():
    async def scenario():
        manager = RoomManager()
        dead_ws = FakeWebSocket(fail=True)
        live_ws = FakeWebSocket()
        room = Room(
            meta_data=RoomMetaData(host_id="dead", settings=RoomSettings()),
            players={
                "dead": player("dead", dead_ws),
                "live": player("live", live_ws),
            },
        )
        manager.rooms["room"] = room
        await manager.broadcast({"event": "TEST", "data": {}}, "room")
        assert live_ws.sent == [{"event": "TEST", "data": {}}]
        assert room.players["dead"].is_present is False
        assert room.meta_data.host_id == "live"

    asyncio.run(scenario())


def test_hard_leave_removes_departed_players_round_references():
    async def scenario():
        manager = RoomManager()
        host_ws = FakeWebSocket()
        leaving_ws = FakeWebSocket()
        room = Room(
            meta_data=RoomMetaData(
                host_id="host",
                settings=RoomSettings(),
                sumbitted_bluffs={"p2": "Bluff"},
                voting_results={"host": "p2-bluff", "p2": "correct"},
                voting_choices=[
                    {
                        "id": "p2-bluff",
                        "text": "Bluff",
                        "author_ids": ["p2"],
                        "is_correct": False,
                    },
                    {
                        "id": "correct",
                        "text": "Truth",
                        "author_ids": [],
                        "is_correct": True,
                    },
                ],
            ),
            players={
                "host": player("host", host_ws),
                "p2": player("p2", leaving_ws),
            },
        )
        manager.rooms["room"] = room
        await manager.remove_connection("p2", "room")
        assert "p2" not in room.players
        assert "p2" not in room.meta_data.sumbitted_bluffs
        assert "p2" not in room.meta_data.voting_results
        assert room.meta_data.voting_results == {"host": "p2-bluff"}
        assert room.meta_data.voting_choices[0]["author_ids"] == []

    asyncio.run(scenario())
