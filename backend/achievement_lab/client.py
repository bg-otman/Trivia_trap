"""Raw JSON terminal client, not a product UI."""
import argparse
import asyncio
import json
from websockets.asyncio.client import connect


async def main(args):
    async with connect(f"{args.url}/room/{args.room}", additional_headers={
        "Authorization": f"Bearer lab-player-{args.user}"}) as ws:
        async def receive():
            async for message in ws:
                print(json.dumps(json.loads(message), ensure_ascii=False, indent=2), flush=True)
        receiver = asyncio.create_task(receive())
        try:
            while True:
                try:
                    line = await asyncio.to_thread(input)
                except EOFError:
                    break
                if line.strip():
                    await ws.send(json.dumps(json.loads(line)))
        finally:
            receiver.cancel()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", required=True)
    parser.add_argument("--user", type=int, choices=range(101, 106), default=101)
    parser.add_argument("--room", default="manual")
    asyncio.run(main(parser.parse_args()))
