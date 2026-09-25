import unicodedata
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from random import shuffle
from uuid import uuid4


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
#ila kan lherf fih tachkiil kasra damma tanfotoh tanhydo tachlkil
        if category.startswith("M"):
            continue
#hna tanfoto bhala 3alamat istifham ta3ajob ? !
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


def build_voting_choices(
    player_count: int,
    bluff_answers: dict[str, str],
    correct_answer: str,
    fake_answers: list[str],
) -> list[dict]:
    target_fake_count = 4 if player_count == 3 else max(3, player_count)
    correct_key = normalize_answer(correct_answer)

    fake_choices: dict[str, dict] = {}

    for player_id, answer in bluff_answers.items():
        key = normalize_answer(answer)

        if not key or key == correct_key:
            continue

        if key in fake_choices:
            fake_choices[key]["author_ids"].append(player_id)
        else:
            fake_choices[key] = {
                "id": uuid4().hex,
                "text": answer,
                "author_ids": [player_id],
                "is_correct": False,
            }

    for decoy in fake_answers:
        if len(fake_choices) >= target_fake_count:
            break

        key = normalize_answer(decoy)

        if not key or key == correct_key or key in fake_choices:
            continue

        fake_choices[key] = {
            "id": uuid4().hex,
            "text": decoy,
            "author_ids": [],
            "is_correct": False,
        }

    choices = list(fake_choices.values())

    choices.append({
        "id": uuid4().hex,
        "text": correct_answer,
        "author_ids": [],
        "is_correct": True,
    })

    shuffle(choices)
    return choices


def validate_vote(
    voter_id: str,
    choice_id: str,
    choices: list[dict],
    votes: dict[str, str],
    player_ids: set[str],
) -> dict:
    if not isinstance(choice_id, str):
        return {"is_valid": False, "reason": "INVALID_PAYLOAD"}

    if voter_id not in player_ids:
        return {"is_valid": False, "reason": "NOT_IN_ROOM"}

    if voter_id in votes:
        return {"is_valid": False, "reason": "ALREADY_VOTED"}

    choice = next(
        (item for item in choices if item["id"] == choice_id),
        None,
    )

    if choice is None:
        return {"is_valid": False, "reason": "INVALID_CHOICE"}

    if voter_id in choice["author_ids"]:
        return {"is_valid": False, "reason": "SELF_VOTE"}

    return {"is_valid": True, "reason": ""}


def calculate_results(
    votes: dict[str, str],
    choices: list[dict],
    players: dict,
) -> dict:
    """Calculate one round without reading or mutating player objects."""
    player_ids = set(players)
    choices_by_id: dict[str, dict] = {}
    correct_choices: list[dict] = []

    for choice in choices:
        choice_id = choice.get("id")
        author_ids = choice.get("author_ids")
        is_correct = choice.get("is_correct")

        if not isinstance(choice_id, str):
            raise ValueError("Choice IDs must be strings")
        if choice_id in choices_by_id:
            raise ValueError("Choice IDs must be unique")
        if not isinstance(author_ids, list):
            raise ValueError("Choice author_ids must be a list")
        if not isinstance(is_correct, bool):
            raise ValueError("Choice is_correct must be a boolean")

        for author_id in author_ids:
            if author_id not in player_ids:
                raise ValueError("Bluff author is outside the room")

        choices_by_id[choice_id] = choice
        if is_correct:
            correct_choices.append(choice)

    if len(correct_choices) != 1:
        raise ValueError("The round must have exactly one correct choice")

    player_stats = {
        player_id: {
            "correct_votes": 0,
            "bluff_votes_received": 0,
            "round_points": 0,
        }
        for player_id in players
    }
    voters_by_choice = {choice_id: [] for choice_id in choices_by_id}

    for voter_id, choice_id in votes.items():
        if voter_id not in player_stats:
            raise ValueError("Vote from a player outside the room")
        if not isinstance(choice_id, str):
            raise ValueError("Choice IDs must be strings")

        choice = choices_by_id.get(choice_id)
        if choice is None:
            raise ValueError("Vote for an unknown choice")
        if voter_id in choice["author_ids"]:
            raise ValueError("Player voted for their own bluff")

        voters_by_choice[choice_id].append(voter_id)
        if choice["is_correct"]:
            player_stats[voter_id]["correct_votes"] += 1
        else:
            for author_id in choice["author_ids"]:
                player_stats[author_id]["bluff_votes_received"] += 1

    for stats in player_stats.values():
        stats["round_points"] = (
            2 * stats["correct_votes"]
            + stats["bluff_votes_received"]
        )

    return {
        "correct_choice_id": correct_choices[0]["id"],
        "choices": [
            {
                "id": choice["id"],
                "text": choice["text"],
                "author_ids": list(choice["author_ids"]),
                "voters": voters_by_choice[choice["id"]],
                "is_correct": choice["is_correct"],
            }
            for choice in choices
        ],
        "player_stats": player_stats,
    }
