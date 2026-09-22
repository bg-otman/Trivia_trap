from .database import AsyncSessionLocal
from .ingestion import (
    get_category_list,
    get_random_question,
)


async def load_categories(
    language_code: str,
) -> list[dict]:
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


