"""Idempotent accounts/questions; no achievements or match history seeded here."""
import asyncio
import os
from sqlalchemy import select
from dataProcessing.database import AsyncSessionLocal
from dataProcessing.models import User, Category, CategoryTranslation, Question, QuestionDecoy
from achievement_lab.app import require_test_database


async def seed(factory):
    async with factory.begin() as session:
        for uid in range(101, 106):
            if await session.get(User, uid) is None:
                session.add(User(id=uid, username=f"User{uid}", email=f"u{uid}@test.invalid",
                                 password_hash="NOT-A-LOGIN-HASH-test-only"))
        for number in range(1, 4):
            name = f"Lab category {number}"
            translation = await session.scalar(select(CategoryTranslation).where(
                CategoryTranslation.language_code == "en", CategoryTranslation.name == name))
            if translation is not None:
                continue
            category = Category()
            session.add(category)
            await session.flush()
            session.add(CategoryTranslation(category_id=category.id, language_code="en", name=name))
            for n in range(1, 13):
                question = Question(category_id=category.id, language_code="en",
                    question_text=f"Lab {number}: what is {n} plus {number}?", correct_answer=str(n + number))
                session.add(question)
                await session.flush()
                session.add_all(QuestionDecoy(question_id=question.id, decoy_text=f"Decoy {number}-{n}-{d}")
                                for d in range(1, 7))


if __name__ == "__main__":
    require_test_database(os.environ["DATABASE_URL"])
    asyncio.run(seed(AsyncSessionLocal))
