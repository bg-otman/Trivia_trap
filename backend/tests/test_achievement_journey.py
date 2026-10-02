"""Real migrated PostgreSQL + TCP + public game events; only identity is substituted.

History fixtures are explicitly synthetic DB results, not games played over TCP.
Current matches always use DB questions, normal timers, votes, scoring and saves.
"""
import asyncio
from contextlib import asynccontextmanager
from uuid import UUID

import pytest
from sqlalchemy import select, func
from websockets.asyncio.client import connect
from websockets.exceptions import InvalidStatus

from achievement_lab.app import create_app
from achievement_lab.seed import seed
from achievement_lab.journey import Journey, WIN
from conftest import tcp_server
from test_persistence import database, seed_history
from dataProcessing import services
from dataProcessing.models import UserAchievement, GamePlayerResult, GamePersistenceEvent, Game
from engine import room_manager


@asynccontextmanager
async def lab(monkeypatch):
    async with database(monkeypatch) as factory:
        await seed(factory)
        manager = room_manager.RoomManager()
        monkeypatch.setattr(room_manager, "manager", manager)
        async with tcp_server(create_app()) as url:
            try:
                yield factory, url, manager
            finally:
                for room in manager.rooms.values():
                    task = room.meta_data.timer_task
                    if task is not None:
                        task.cancel()


def awards(payload, uid=101):
    return set(payload["unlocked_achievements"].get(str(uid), []))


async def stored(factory, uid=101):
    async with factory() as session:
        return set((await session.scalars(select(UserAchievement.achievement_code).where(
            UserAchievement.user_id == uid))).all())


async def persisted_result(factory, final, uid=101):
    assert final["persistence"]["status"] == "saved"
    async with factory() as session:
        game_id = UUID(final["persistence"]["game_id"])
        assert (await session.get(Game, game_id)).finished_at is not None
        return await session.get(GamePlayerResult, (game_id, uid))


@pytest.mark.parametrize("votes,shared,expected,other_authors", [
    ({101: "correct", 102: 101, 103: 101, 104: 101, 105: 102}, False, {"LONE_GENIUS"}, []),
    (WIN, False, {"BLUFFER", "LONE_GENIUS", "PERFECT_TRAP"}, []),
    ({101: 103, 102: 103, 103: 101, 104: 101, 105: 101}, True, {"PERFECT_TRAP"}, [102]),
    ({101: "correct", 102: "correct", 103: 101, 104: 102, 105: 103}, False, set(), []),
    ({101: "correct", 102: 101, 103: 101, 104: 101, 105: None}, False, {"LONE_GENIUS"}, []),
])
def test_round_boundaries_through_public_events(monkeypatch, votes, shared, expected, other_authors):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager), Journey(url) as game:
            await game.start(1)
            result = await game.play(votes, shared)
            assert awards(result) == expected
            assert await stored(factory) == expected
            for uid in other_authors:
                assert awards(result, uid) == {"PERFECT_TRAP"}
                assert await stored(factory, uid) == {"PERFECT_TRAP"}
            if sum(target == "correct" for target in votes.values()) != 1:
                assert all("LONE_GENIUS" not in codes for codes in result["unlocked_achievements"].values())
            # Independent arithmetic for scores, including shared authors.
            for uid, player in manager.rooms[game.room].players.items():
                authored = {int(uid)} | ({101, 102} if shared and int(uid) in {101, 102} else set())
                expected_score = int(votes[int(uid)] == "correct") + 2 * sum(target in authored for target in votes.values())
                assert player.score == expected_score
            final = await game.podium()
            if "persistence" in final:
                for uid in game.clients:
                    row = await persisted_result(factory, final, uid)
                    assert row.final_score == manager.rooms[game.room].players[str(uid)].score
    asyncio.run(scenario())


def test_streak_total_missing_vote_and_tenth_correct_from_zero(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager), Journey(url) as game:
            await game.start(12)
            truth_rounds, einstein_rounds = [], []
            for number in range(1, 13):
                votes = dict(WIN)
                if number == 3:
                    votes[101] = 102  # wrong; points from own bluff still count for ON_FIRE
                if number == 6:
                    votes[101] = None  # real timer closes voting; still earns eight bluff points
                result = await game.play(votes)
                if "TRUTH_SEEKER" in awards(result):
                    truth_rounds.append(number)
                if "EINSTEIN" in awards(result):
                    einstein_rounds.append(number)
                if number == 11:
                    assert manager.rooms[game.room].meta_data.correct_answer_totals["101"] == 9
                    assert "EINSTEIN" not in await stored(factory)
                final = await game.podium()
                if number < 12:
                    assert "persistence" not in final
                    await game.advance()
            assert truth_rounds == [11]  # four correct after each break never unlock
            assert einstein_rounds == [12]
            assert "ON_FIRE" in awards(final)
            assert not awards(final, 103)  # zero-point rounds
            assert {"TRUTH_SEEKER", "EINSTEIN", "ON_FIRE"} <= await stored(factory)
            row = await persisted_result(factory, final)
            assert row.final_score == 106 and row.bluff_votes_received == 48
            # A new match in the same room starts at zero, without overwriting last result.
            old_id = final["persistence"]["game_id"]
            await game.start(1)
            room = manager.rooms[game.room]
            assert all(p.score == p.bluff_votes_received == 0 for p in room.players.values())
            assert room.meta_data.correct_answer_totals == {}
            assert room.meta_data.last_match_result["data"]["persistence"]["game_id"] == old_id
            result = await game.play(WIN)
            final = await game.podium()
            assert final["persistence"]["game_id"] != old_id
            assert (await persisted_result(factory, final)).final_score == 9
            assert "TRUTH_SEEKER" not in awards(result)
    asyncio.run(scenario())


def test_fifth_correct_once_and_multiple_round_awards(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager), Journey(url) as game:
            await game.start(11)
            unlocked = []
            for number in range(1, 12):
                result = await game.play({**WIN, 101: 102} if number == 6 else WIN)
                if "TRUTH_SEEKER" in awards(result):
                    unlocked.append(number)
                if number == 5:
                    assert {"BLUFFER", "PERFECT_TRAP", "LONE_GENIUS", "TRUTH_SEEKER"} <= awards(result)
                if number < 5:
                    assert "TRUTH_SEEKER" not in await stored(factory)
                final = await game.podium()
                if number < 11:
                    await game.advance()
            assert unlocked == [5]  # second five-correct streak does not re-announce
            assert "EINSTEIN" in awards(result)
            assert {"TRUTH_SEEKER", "EINSTEIN"} <= await stored(factory)
    asyncio.run(scenario())


# Round one: host is strictly last with one point; everyone else has two.
LAST = {101: "correct", 102: 103, 103: 104, 104: 105, 105: 102}
# Two tied last players, with positive scores: 101/102 = 1, others = 2.
TIED_LAST = {101: "correct", 102: "correct", 103: 104, 104: 105, 105: 103}


@pytest.mark.parametrize("first,second,success", [
    (LAST, WIN, True),
    (TIED_LAST, WIN, True),
    ({uid: "correct" for uid in range(101, 106)}, WIN, False),
    (WIN, WIN, False),
    (LAST, {101: 102, 102: "correct", 103: 102, 104: 102, 105: 102}, False),
])
def test_remontada_and_on_fire_real_finish(monkeypatch, first, second, success):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager), Journey(url) as game:
            await game.start(2)
            await game.play(first)
            middle = await game.podium()
            assert not middle["unlocked_achievements"]
            await game.advance()
            await game.play(second)
            final = await game.podium()
            assert ("REMONTADA_MASTER" in awards(final)) == success
            assert ("REMONTADA_MASTER" in await stored(factory)) == success
            if success:
                assert {"REMONTADA_MASTER", "ON_FIRE", "FIRST_VICTORY"} <= awards(final)
                assert (await persisted_result(factory, final)).final_rank == 1
    asyncio.run(scenario())


def test_odd_midpoint_and_tiebreaker_snapshot_are_real(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager), Journey(url) as game:
            await game.start(3)
            # [1,2,2,2,2], then [2,4,4,4,4]; midpoint is after round TWO.
            for n in range(2):
                await game.play(LAST)
                room = manager.rooms[game.room]
                assert room.meta_data.remontada_midpoint_round == 2
                assert room.meta_data.remontada_last_player_ids == (None if n == 0 else {"101"})
                await game.podium()
                await game.advance()
            # +[4,2,2,2,0] makes four leaders tied at six points.
            await game.play({101: 102, 102: 101, 103: 101, 104: 103, 105: 104})
            tied = await game.podium()
            assert not tied["unlocked_achievements"] and "persistence" not in tied
            assert "ON_FIRE" not in await stored(factory)
            async with factory() as session:
                assert await session.scalar(select(func.count()).select_from(GamePlayerResult)) == 0
            snapshot = set(room.meta_data.remontada_last_player_ids)
            await game.advance()
            await game.play(WIN)
            final = await game.podium()
            assert room.meta_data.remontada_last_player_ids == snapshot
            assert {"REMONTADA_MASTER", "ON_FIRE"} <= awards(final)
            assert "ON_FIRE" not in awards(final, 102)  # zero in extra round
            assert (await persisted_result(factory, final)).final_score == 15
    asyncio.run(scenario())


@pytest.mark.parametrize("offset", [-1, 0, 1])
def test_historical_thresholds_current_match_is_played(monkeypatch, offset):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager):
            # Synthetic completed results; never insert any target achievement.
            await seed_history(factory, 29 + offset, wins=9 + offset, points=91 + offset, bluff_votes=21 + offset)
            assert not await stored(factory)
            async with Journey(url) as game:
                await game.start(1)
                await game.play(WIN)  # +1 completed game/win, +9 points, +4 bluff votes
                final = await game.podium()
                targets = {"VETERAN", "CHAMPION", "MESSSSI", "DECEPTION_MASTER"}
                assert targets & awards(final) == (targets if offset >= 0 else set())
                assert targets & await stored(factory) == (targets if offset >= 0 else set())
                assert "FIRST_VICTORY" in awards(final)
                async with factory() as session:
                    assert await services.get_user_history(session, 101) == dict(completed_games=30 + offset,
                        wins=10 + offset, points=100 + offset, bluff_votes=25 + offset)
                    assert (await services.get_user_history(session, 102))["wins"] == 0
                assert not (targets & await stored(factory, 102))
    asyncio.run(scenario())


def test_first_victory_after_losses_and_only_once(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager):
            await seed_history(factory, 3)  # three losses, not a planted achievement
            async with Journey(url) as game:
                for winner in (102, 101, 101):
                    await game.start(1)
                    await game.play({uid: "correct" if uid == winner else winner for uid in game.clients})
                    final = await game.podium()
                    if winner == 102:
                        assert "FIRST_VICTORY" not in await stored(factory)
                    else:
                        async with factory() as session:
                            wins = (await services.get_user_history(session, 101))["wins"]
                        assert ("FIRST_VICTORY" in awards(final)) == (wins == 1)
                assert "FIRST_VICTORY" in await stored(factory)
    asyncio.run(scenario())


def test_collector_nine_distinct_then_earn_tenth(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager):
            nine = ["LONE_GENIUS", "PERFECT_TRAP", "ON_FIRE", "REMONTADA_MASTER", "VETERAN",
                    "FIRST_VICTORY", "CHAMPION", "MESSSSI", "DECEPTION_MASTER"]
            await services.save_unlocked_achievements({101: nine + nine})
            assert len(await stored(factory)) == 9
            async with Journey(url) as game:
                await game.start(1)
                await game.play({101: "correct", 102: 101, 103: 101, 104: 101, 105: 102})
                final = await game.podium()
                assert "COLLECTOR" not in awards(final)
                assert len(await stored(factory)) == 9
                for iteration in range(2):
                    await game.start(1)
                    result = await game.play(WIN)  # actually earns BLUFFER, the tenth other code
                    final = await game.podium()
                    assert "BLUFFER" in awards(result)
                    assert ("COLLECTOR" in awards(final)) == (iteration == 0)
                    assert await stored(factory) == set(nine) | {"BLUFFER", "COLLECTOR"}
                    if iteration == 0:
                        assert final["newly_saved_achievements"]["101"] == ["COLLECTOR"]
    asyncio.run(scenario())


def test_test_tokens_reject_spoofing_and_unknown_accounts(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager):
            for headers in ({}, {"Authorization": "Bearer invalid"}, {"Authorization": "Bearer lab-player-999"}):
                with pytest.raises(InvalidStatus):
                    async with connect(url + "/room/attack?user_id=101&user_name=User101", additional_headers=headers):
                        pytest.fail("Unauthenticated socket accepted")
            async with Journey(url) as game:
                # Authenticated user 102 cannot become 101 by supplying a different ID.
                await game.clients[102].close()
                await asyncio.sleep(.05)
                await game.join(102, "?user_id=101&user_name=Impostor")
                await game.send("CHAT_MESSAGE", {"message": "identity", "user_id": 101}, 102)
                payload = await game.everyone("CHAT_MESSAGE")
                assert payload["player"]["id"] == "102"
                assert payload["player"]["username"] == "User102"
                assert len(manager.rooms[game.room].players) == 5
    asyncio.run(scenario())


@pytest.mark.parametrize("failure_phase", ["round", "finish"])
def test_real_network_transaction_failure_retry_and_duplicate(monkeypatch, failure_phase):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager), Journey(url) as game:
            await game.start(1)
            await game.voting()
            original = services._insert_achievements
            async def fail(session, unlocked):
                await original(session, unlocked)
                # Trigger an actual SQL error after inserts, forcing PostgreSQL rollback.
                from sqlalchemy import text
                await session.execute(text("SELECT 1 / 0"))
            if failure_phase == "round":
                monkeypatch.setattr(services, "_insert_achievements", fail)
                await game.cast(WIN)
                error = await game.receive(105, "ERROR")  # last voter triggers closing
            else:
                await game.cast(WIN)
                await game.everyone("RESULTS_REVEALED")
                monkeypatch.setattr(services, "_insert_achievements", fail)
                await game.send("NEXT_PHASE")
                error = await game.receive(101, "ERROR")
            assert error["code"] == "PERSISTENCE_FAILED"
            async with factory() as session:
                assert await session.scalar(select(func.count()).select_from(GamePlayerResult)) == 0
                if failure_phase == "round":
                    assert await session.scalar(select(func.count()).select_from(UserAchievement)) == 0
            assert manager.rooms[game.room].players["101"].score == 9
            monkeypatch.setattr(services, "_insert_achievements", original)
            await game.send("RETRY_PERSISTENCE")
            result = await game.everyone("RESULTS_REVEALED" if failure_phase == "round" else "PHASE_PODIUM")
            # An explicit duplicate retry is rejected, never treated as another round/match.
            await game.send("RETRY_PERSISTENCE")
            error = await game.receive(101, "ERROR")
            assert error["code"] in {"NOTHING_PENDING", "INVALID_PHASE", "INVALID_EVENT"}
            final = await game.podium() if failure_phase == "round" else result
            assert (await persisted_result(factory, final)).final_score == 9
            async with factory() as session:
                assert await session.scalar(select(func.count()).select_from(GamePlayerResult)) == 5
                assert await session.scalar(select(func.count()).select_from(GamePersistenceEvent)) == 2
    asyncio.run(scenario())


def test_two_concurrent_rooms_same_users_isolated_and_persisted(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager):
            async with Journey(url) as first, Journey(url) as second:
                await asyncio.gather(first.start(1), second.start(1))
                results = await asyncio.gather(first.play(WIN), second.play(WIN))
                assert results[0]["persistence"]["game_id"] != results[1]["persistence"]["game_id"]
                finals = await asyncio.gather(first.podium(), second.podium())
                assert sum("FIRST_VICTORY" in awards(final) for final in finals) == 1
                for game, final in zip((first, second), finals):
                    assert manager.rooms[game.room].players["101"].score == 9
                    assert (await persisted_result(factory, final)).final_score == 9
                async with factory() as session:
                    assert await services.get_user_history(session, 101) == dict(completed_games=2, wins=2, points=18, bluff_votes=8)
    asyncio.run(scenario())


def test_disconnect_reconnect_and_permanent_leave_rejoin(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager), Journey(url) as game:
            await game.start(2)
            await game.play(LAST)
            await game.podium()
            room = manager.rooms[game.room]
            await game.clients[102].close()
            await asyncio.sleep(.05)
            assert not room.players["102"].is_present
            await game.join(102)
            assert room.players["102"].score == 2 and room.players["102"].on_fire_eligible
            await game.send("LEAVE_ROOM", uid=103)
            await game.clients[103].wait_closed()
            # Synchronize removal through the normal broadcast, not a timing assumption.
            async with asyncio.timeout(3):
                while "103" in room.players:
                    await asyncio.sleep(.01)
            await game.join(103)
            assert room.players["103"].score == 2
            assert not room.players["103"].on_fire_eligible
            assert not room.players["103"].remontada_eligible
            await game.advance()
            await game.play(WIN)
            final = await game.podium()
            assert "ON_FIRE" in awards(final)
            assert "ON_FIRE" not in awards(final, 103)
            assert (await persisted_result(factory, final, 103)).final_score == 2
    asyncio.run(scenario())


def test_late_join_and_departed_player_end_eligibility(monkeypatch):
    async def scenario():
        async with lab(monkeypatch) as (factory, url, manager), Journey(url) as game:
            # Leave the lobby, then enter after the match starts: never start-eligible.
            await game.send("LEAVE_ROOM", uid=105)
            await game.clients.pop(105).wait_closed()
            room = manager.rooms[game.room]
            async with asyncio.timeout(3):
                while "105" in room.players:
                    await asyncio.sleep(.01)
            await game.start(2)
            await game.join(105)
            assert not room.players["105"].on_fire_eligible
            await game.play(LAST)
            await game.podium()
            await game.advance()
            await game.play({101: 105, 102: 105, 103: 105, 104: 105, 105: "correct"})
            # Another initially present player leaves permanently before the finish.
            await game.send("LEAVE_ROOM", uid=104)
            await game.clients.pop(104).wait_closed()
            async with asyncio.timeout(3):
                while "104" in room.players:
                    await asyncio.sleep(.01)
            final = await game.podium()
            assert "ON_FIRE" not in awards(final, 105)
            assert "REMONTADA_MASTER" not in awards(final, 105)
            assert not awards(final, 104)
            assert (await persisted_result(factory, final, 105)).final_score == 11
            departed = await persisted_result(factory, final, 104)
            assert departed.final_score == 2 and departed.final_rank > 1
    asyncio.run(scenario())
