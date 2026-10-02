from datetime import datetime, timezone
from hashlib import sha256
import json
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from .database import AsyncSessionLocal
from .ingestion import get_category_list, get_random_question
from .achievements import AchievementCode, evaluate_historical_achievements, evaluate_collector
from .models import (Game, GamePlayerCategoryResult, GamePlayerResult,
                     GamePersistenceEvent, UserAchievement, User)


async def load_categories(language_code: str) -> list[dict] | None:
    async with AsyncSessionLocal() as session:
        return await get_category_list(session=session, language_code=language_code)


async def load_question(category_id: int, language_code: str) -> dict | None:
    async with AsyncSessionLocal() as session:
        return await get_random_question(session=session, category_id=category_id, language_code=language_code)


async def _lock_users(session, user_ids):
    # Same lock order for every achievement/result transaction, across rooms/processes.
    for user_id in sorted(set(user_ids)):
        if type(user_id) is not int or user_id <= 0:
            raise ValueError("A verified integer user ID is required")
        await session.execute(select(func.pg_advisory_xact_lock(74191, user_id)))
    found = set((await session.scalars(select(User.id).where(User.id.in_(user_ids)))).all())
    if found != set(user_ids):
        raise ValueError("Unknown authenticated user")


async def _insert_achievements(session, unlocked):
    rows = [{"user_id": uid, "achievement_code": AchievementCode(code).value}
            for uid, codes in sorted(unlocked.items()) for code in sorted(set(codes))]
    if not rows:
        return {}
    result = await session.execute(insert(UserAchievement).values(rows).on_conflict_do_nothing(
        index_elements=["user_id", "achievement_code"]
    ).returning(UserAchievement.user_id, UserAchievement.achievement_code))
    saved = {}
    for uid, code in result.all():
        saved.setdefault(str(uid), []).append(code)
    return saved


async def save_unlocked_achievements(unlocked: dict[int, list[AchievementCode]]) -> dict[int, list[str]]:
    async with AsyncSessionLocal.begin() as session:
        await _lock_users(session, list(unlocked))
        saved = await _insert_achievements(session, unlocked)
    return {int(uid): codes for uid, codes in saved.items()}


def _request_hash(payload):
    return sha256(json.dumps(payload, sort_keys=True, default=str, separators=(",", ":")).encode()).hexdigest()


async def _begin_event(session, match, event_key, payload, user_ids):
    await _lock_users(session, [match["host_user_id"], *user_ids])
    await session.execute(insert(Game).values(**match).on_conflict_do_nothing(index_elements=["id"]))
    game = await session.scalar(select(Game).where(Game.id == match["id"]).with_for_update())
    for field in ("host_user_id", "language_code", "total_rounds", "started_at"):
        if getattr(game, field) != match[field]:
            raise ValueError("Match ID reused with different metadata")
    digest = _request_hash(payload)
    previous = await session.get(GamePersistenceEvent, (match["id"], event_key))
    if previous is not None:
        if previous.request_hash != digest:
            raise ValueError("Persistence operation reused with different data")
        return game, digest, previous.result
    if game.finished_at is not None:
        raise ValueError("Cannot change a completed match")
    return game, digest, None


async def save_round_achievements(*, match: dict, round_number: int, unlocked: dict[int, list[str]]) -> dict:
    if round_number < 1:
        raise ValueError("Invalid round number")
    key = f"round:{round_number}"
    payload = {str(uid): sorted(set(codes)) for uid, codes in unlocked.items()}
    async with AsyncSessionLocal.begin() as session:
        _, digest, previous = await _begin_event(session, match, key, payload, list(unlocked))
        if previous is not None:
            return previous
        saved = await _insert_achievements(session, unlocked)
        receipt = {"newly_saved": saved, "historical": {}}
        session.add(GamePersistenceEvent(game_id=match["id"], event_key=key,
                                         request_hash=digest, result=receipt))
    # Only return success after commit, including the durable receipt.
    return receipt


async def get_user_history(session, user_id: int) -> dict:
    result = (await session.execute(select(
        func.count(GamePlayerResult.game_id),
        func.count(GamePlayerResult.game_id).filter(GamePlayerResult.final_rank == 1),
        func.coalesce(func.sum(GamePlayerResult.final_score), 0),
        func.coalesce(func.sum(GamePlayerResult.bluff_votes_received), 0),
    ).join(Game).where(GamePlayerResult.user_id == user_id, Game.finished_at.is_not(None)))).one()
    return dict(zip(("completed_games", "wins", "points", "bluff_votes"), result))


async def save_game_results(*, game_id: UUID, host_user_id: int, language_code: str,
                            total_rounds: int, started_at: datetime,
                            player_results: list[dict], category_results: list[dict],
                            unlocked: dict[int, list[str]] | None = None) -> dict:
    """Commit one immutable completed match, its achievements and replayable receipt."""
    if total_rounds < 1 or not player_results:
        raise ValueError("A completed match needs rounds and participants")
    unlocked = unlocked or {}
    user_ids = [row["user_id"] for row in player_results]
    if len(set(user_ids)) != len(user_ids) or not set(unlocked).issubset(user_ids):
        raise ValueError("Duplicate or unknown match participant")
    match = dict(id=game_id, host_user_id=host_user_id, language_code=language_code,
                 total_rounds=total_rounds, started_at=started_at)
    payload = {"players": sorted(player_results, key=lambda row: row["user_id"]),
               "categories": sorted(category_results, key=lambda row: (row["user_id"], row["category_id"])),
               "unlocked": {str(uid): sorted(set(codes)) for uid, codes in unlocked.items()}}
    async with AsyncSessionLocal.begin() as session:
        game, digest, previous = await _begin_event(session, match, "finish", payload, user_ids)
        if previous is not None:
            return previous
        session.add_all(GamePlayerResult(game_id=game_id, **row) for row in player_results)
        await session.flush()
        session.add_all(GamePlayerCategoryResult(game_id=game_id, **row) for row in category_results)
        game.finished_at = datetime.now(timezone.utc)
        await session.flush()
        historical = {}
        merged = {uid: list(codes) for uid, codes in unlocked.items()}
        for uid in sorted(user_ids):
            codes = evaluate_historical_achievements(**await get_user_history(session, uid))
            historical[uid] = [code.value for code in codes]
            merged.setdefault(uid, []).extend(codes)
        saved = await _insert_achievements(session, merged)
        # Count distinct persisted codes after all other newly-earned achievements.
        for uid in sorted(user_ids):
            owned = set((await session.scalars(select(UserAchievement.achievement_code).where(
                UserAchievement.user_id == uid))).all())
            collector = evaluate_collector(owned)
            historical[uid].extend(code.value for code in collector)
            extra = await _insert_achievements(session, {uid: collector})
            for key, codes in extra.items():
                saved.setdefault(key, []).extend(codes)
        # Historical awards broadcast only on their first permanent unlock.
        historical_new = {str(uid): [code for code in codes if code in saved.get(str(uid), [])]
                          for uid, codes in historical.items()}
        receipt = {"newly_saved": saved,
                   "historical": {uid: codes for uid, codes in historical_new.items() if codes}}
        session.add(GamePersistenceEvent(game_id=game_id, event_key="finish", request_hash=digest, result=receipt))
    return receipt
