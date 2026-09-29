from .database import AsyncSessionLocal
from .ingestion import (
    get_category_list,
    get_random_question,
)
from sqlalchemy.dialects.postgresql import insert
from .achievements import AchievementCode
from .models import UserAchievement

async def load_categories(
    language_code: str,
) -> list[dict] | None:
    async with AsyncSessionLocal() as session:
        return await get_category_list(
            session=session,
            language_code=language_code,
        )


async def load_question(
    category_id: int,
    language_code: str,
) -> dict | None:
    async with AsyncSessionLocal() as session:
        return await get_random_question(
            session=session,
            category_id=category_id,
            language_code=language_code,
        )

from datetime import datetime, timezone
from uuid import UUID

from .database import AsyncSessionLocal
from .models import (
    Game,
    GamePlayerCategoryResult,
    GamePlayerResult,
)


async def save_game_results(
    *,
    host_user_id: int,
    language_code: str,
    total_rounds: int,
    started_at: datetime,
    player_results: list[dict],
    category_results: list[dict],
) -> UUID:
    if not isinstance(host_user_id, int):
        raise ValueError("host_user_id must be an integer")

    if total_rounds < 1:
        raise ValueError("total_rounds must be positive")

    finished_at = datetime.now(timezone.utc)

    async with AsyncSessionLocal.begin() as session:
        game = Game(
            host_user_id=host_user_id,
            language_code=language_code,
            total_rounds=total_rounds,
            started_at=started_at,
            finished_at=finished_at,
        )

        session.add(game)

        await session.flush()

        game_id = game.id

        results = [
            GamePlayerResult(
                game_id=game_id,
                user_id=result["user_id"],
                final_score=result["final_score"],
                final_rank=result["final_rank"],
                bluff_votes_received=result[
                    "bluff_votes_received"
                ],
            )
            for result in player_results
        ]

        session.add_all(results)

        await session.flush()

        category_statistics = [
            GamePlayerCategoryResult(
                game_id=game_id,
                user_id=result["user_id"],
                category_id=result["category_id"],
                questions_played=result["questions_played"],
                correct_answers=result["correct_answers"],
            )
            for result in category_results
        ]

        session.add_all(category_statistics)

    return game_id


async def save_unlocked_achievements(
    unlocked: dict[int, list[AchievementCode]],
) -> dict[int, list[str]]:
    rows = [
        {
            "user_id": user_id,
            "achievement_code": code.value,
        }
        for user_id, codes in unlocked.items()
        for code in codes
    ]

    if not rows:
        return {}
# save unlocked achievements to the database .on_conflict_do_nothing() is used to avoid inserting duplicate achievements for the same user. The function returns a dictionary mapping user IDs to lists of achievement codes that were successfully saved to the database.
    async with AsyncSessionLocal.begin() as session:
        statement = (
            insert(UserAchievement)
            .values(rows)
            .on_conflict_do_nothing(
                index_elements=[
                    "user_id",
                    "achievement_code",
                ]
            )
            .returning(
                UserAchievement.user_id,
                UserAchievement.achievement_code,
            )
        )

        result = await session.execute(statement)

    saved = {}

    for user_id, achievement_code in result.all():
        saved.setdefault(user_id, []).append(
            achievement_code
        )

    return saved

# saved = {
#     5: ["BLUFFER", "LONE_GENIUS"]
# }