"""Five real network clients driving the unmodified game event protocol."""
import argparse
import asyncio
from contextlib import AsyncExitStack
import json
import re
from uuid import uuid4
from websockets.asyncio.client import connect


class Journey:
    def __init__(self, url, room=None):
        self.url = url
        self.room = room or "lab-" + uuid4().hex
        self.clients = {}
        self.stack = AsyncExitStack()
        self.round_number = 0

    async def __aenter__(self):
        await self.stack.__aenter__()
        for uid in range(101, 106):
            await self.join(uid)
        return self

    async def __aexit__(self, *exc):
        await self.stack.__aexit__(*exc)

    async def join(self, uid, query=""):
        ws = await self.stack.enter_async_context(connect(f"{self.url}/room/{self.room}{query}",
            additional_headers={"Authorization": f"Bearer lab-player-{uid}"}))
        self.clients[uid] = ws
        await self.receive(uid, "LOBBY_UPDATE")
        return ws

    async def send(self, event, data=None, uid=101):
        await self.clients[uid].send(json.dumps({"event": event, "data": data or {}}))

    async def receive(self, uid, event, timeout=16):
        async with asyncio.timeout(timeout):
            while True:
                message = json.loads(await self.clients[uid].recv())
                if message["event"] == event:
                    return message["data"]
                if message["event"] == "ERROR":
                    raise AssertionError(f"User {uid}: {message}")

    async def everyone(self, event):
        messages = await asyncio.gather(*(self.receive(uid, event) for uid in self.clients))
        assert all(message == messages[0] for message in messages), (event, messages)
        return messages[0]

    async def start(self, rounds):
        await self.send("UPDATE_SETTINGS", {"total_rounds": rounds, "bluff_time": 10,
            "vote_time": 10, "max_players": 5, "language": "en"})
        await self.send("NEXT_PHASE")
        self.category = await self.everyone("PHASE_CATEGORY")
        self.round_number = 0

    async def voting(self, shared=False):
        await self.send("GET_QUESTION", {"category": self.category["categories"][0]})
        question = await self.everyone("PHASE_QUESTION")
        self.round_number += 1
        assert question["round"] == self.round_number
        # Solve the seeded arithmetic question received from the actual DB loader.
        found = re.fullmatch(r"Lab (\d+): what is (\d+) plus (\d+)\?", question["question"])
        assert found, question
        correct = str(int(found[2]) + int(found[3]))
        bluffs = {uid: f"Bluff {self.round_number} by {uid}" for uid in self.clients}
        if shared:
            bluffs[102] = bluffs[101]
        for uid, answer in bluffs.items():
            await self.send("SUBMIT_BLUFF", {"bluff_answer": answer}, uid)
        voting = await self.everyone("PHASE_VOTING")
        by_text = {choice["text"]: choice["id"] for choice in voting["choices"]}
        self.choices = {"correct": by_text[correct], **{uid: by_text[bluff] for uid, bluff in bluffs.items()}}
        return voting

    async def cast(self, votes):
        for uid, target in votes.items():
            if target is not None:
                await self.send("SUBMIT_VOTE", {"choice_id": self.choices[target]}, uid)

    async def play(self, votes, shared=False):
        await self.voting(shared)
        await self.cast(votes)
        results = await self.everyone("RESULTS_REVEALED")
        assert results["persistence"]["status"] == "saved"
        return results

    async def podium(self):
        await self.send("NEXT_PHASE")
        return await self.everyone("PHASE_PODIUM")

    async def advance(self):
        await self.send("NEXT_PHASE")
        self.category = await self.everyone("PHASE_CATEGORY")


WIN = {101: "correct", 102: 101, 103: 101, 104: 101, 105: 101}


async def demo(url):
    async with Journey(url) as game:
        await game.start(1)
        result = await game.play(WIN)
        final = await game.podium()
        print(json.dumps({"room": game.room, "round": result, "finish": final}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    asyncio.run(demo(parser.parse_args().url))
