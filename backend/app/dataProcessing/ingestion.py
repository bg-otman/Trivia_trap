import unicodedata
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import (
    Category,
    CategoryTranslation,
    Question,
)

async def get_category_list(
    session: AsyncSession,
    language_code: str,
) -> list[dict]:
    statement = (
        select(
            Category.id,
            Category.image_url,
            CategoryTranslation.name,
        )
        .join(
            CategoryTranslation,
            CategoryTranslation.category_id == Category.id,
        )
        .where(
            CategoryTranslation.language_code == language_code,
        )
        .order_by(Category.id)
    )

    result = await session.execute(statement)

    return [
        {
            "id": row.id,
            "name": row.name,
            "image_url": row.image_url,
        }
        for row in result.all()
    ]

async def get_random_question(
    session: AsyncSession,
    category_id: int,
    language_code: str,
) -> dict | None:
    statement = (
        select(Question)
        .options(selectinload(Question.decoys))
        .where(
            Question.category_id == category_id,
            Question.language_code == language_code,
        )
        .order_by(func.random())
        .limit(1)
    )

    result = await session.execute(statement)
    question = result.scalar_one_or_none()

    if question is None:
        return None

    return {
        "id": question.id,
        "question": question.question_text,
        "correct_answer": question.correct_answer,
        "image_url": question.image_url,
        "fake_answers": [
            decoy.decoy_text
            for decoy in question.decoys
        ],
    }


def normalize_answer(answer: str) -> str:
    normalized = unicodedata.normalize(
        "NFKC",
        answer,
    ).casefold()

    cleaned_characters = []

    for character in normalized:
        category = unicodedata.category(character)

        if category.startswith("M"):
            continue

        if category.startswith("P"):
            cleaned_characters.append(" ")
            continue

        cleaned_characters.append(character)

    return " ".join(
        "".join(cleaned_characters).split()
    )



def validate_bluff_answer(
    bluff_answer: str,
    correct_answer: str,
) -> dict:
    normalized_bluff = normalize_answer(bluff_answer)
    normalized_correct = normalize_answer(correct_answer)

    if not normalized_bluff:
        return {
            "is_valid": False,
            "reason": "EMPTY_ANSWER",
        }

    if normalized_bluff == normalized_correct:
        return {
            "is_valid": False,
            "reason": "EXACT_TRUTH",
        }

    return {
        "is_valid": True,
        "reason": "",
    }

def build_voting_choices(player_count: int, bluff_answers: dict, correct_answer: str, fake_answers: list) -> list[dict[str, str]]:
    """
        Get the choices for voting phase. This includes the correct answer and all bluff answers submitted by players.
    """
    # shuffle the bluff answers and add the correct answer to the list of choices
    # fallback to add fake answers if there are not enough bluff answers submitted by players

    # i will add demo choices for now.
    choices = []
    choices.append({ "id": "c1", "text": correct_answer })
    for player_id, bluff_answer in bluff_answers.items():
        choices.append({ "id": f"b_{player_id}", "text": bluff_answer })
    for i, fake_answer in enumerate(fake_answers):
        choices.append({ "id": f"f_{i}", "text": fake_answer })
    return choices

def calculate_results(votes: dict[str, str], bluffs: dict[str, str], correct_answer: str, players: dict[str, dict]) -> dict:
    """
        Calculate the results of the round based on the voting results and submitted bluffs.
    """
    # the expected output is in the return statement below. For now, i will return a demo result.
    return {
        "correct_choice_id": "2",
        "choices": [
          {
            "id": "1",
            "text": "Austria",
            "author_name": "usr_1",
            "voters": ["usr_2, usr_3"]
          },
          {
            "id": "2",
            "text": "Switzerland",
            "author_name": None, # None because it's the correct answer
            "voters": ["usr_1"]
          }
        ],
        "leaderboard": [
          { "username": "alice", "score": 10 },
          { "username": "bob", "score": 5 }
        ]
      }