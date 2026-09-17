from collections.abc import AsyncIterator
from sqlalchemy.ext.asyncio import AsyncSession
from dataProcessing.database import AsyncSessionLocal


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as db:
        yield db
