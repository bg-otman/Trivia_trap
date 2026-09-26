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
) -> list[dict] | None:
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

    try:
        result = await session.execute(statement)
    except Exception as e:
        return None

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

    try:
        result = await session.execute(statement)
    except Exception as e:
        return None

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
            fake_choices[key]["authors_names"].append(player_id)
        else:
            fake_choices[key] = {
                "id": uuid4().hex,
                "text": answer,
                "authors_names": [player_id],
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
            "authors_names": [],
            "is_correct": False,
        }

    choices = list(fake_choices.values())

    choices.append({
        "id": uuid4().hex,
        "text": correct_answer,
        "authors_names": [],
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

    if voter_id in choice["authors_names"]:
        return {"is_valid": False, "reason": "SELF_VOTE"}

    return {"is_valid": True, "reason": ""}


def calculate_results(
    votes: dict[str, str],
    bluffs: dict[str, str],
    correct_answer: str,
    players: dict[str, "PlayerInfo"],
    voting_choices: list[dict],
) -> dict:
    """
    Calculate the round results from the choices that were actually broadcast in the vote phase.
    """
    if not voting_choices:
        raise ValueError("Voting choices are missing for the current round")

    choices_by_id = {
        choice["id"]: {
            **choice,
            "authors_names": list(choice.get("authors_names", [])),
            "voters": [],
        }
        for choice in voting_choices
    }
    correct_choice = next((choice for choice in choices_by_id.values() if choice.get("is_correct")), None)

    if correct_choice is None:
        raise ValueError("Voting choices must include exactly one correct answer")

    normalized_correct_answer = normalize_answer(correct_answer)

    bluff_owner_names: dict[str, list[str]] = {}
    for player_id, bluff_text in bluffs.items():
        normalized_bluff = normalize_answer(bluff_text)
        if not normalized_bluff or normalized_bluff == normalized_correct_answer:
            continue
        player = players.get(player_id)
        if player is None:
            continue
        bluff_owner_names.setdefault(normalized_bluff, []).append(player.name)

    choice_by_normalized_text = {
        normalize_answer(choice["text"]): choice
        for choice in choices_by_id.values()
    }

    for normalized_text, authors_names in bluff_owner_names.items():
        choice = choice_by_normalized_text.get(normalized_text)
        if choice is None or choice.get("is_correct"):
            continue
        choice.setdefault("authors_names", [])
        choice["authors_names"].extend(authors_names)

    for voter_id, choice_id in votes.items():
        choice = choices_by_id.get(choice_id)
        player = players.get(voter_id)
        if choice is None or player is None:
            continue
        choice.setdefault("voters", [])
        choice["voters"].append(player.name)

    player_scores = {player_id: 0 for player_id in players}

    for choice in choices_by_id.values():
        if choice.get("is_correct"):
            for voter_name in choice.get("voters", []):
                for player_id, player in players.items():
                    if player.name == voter_name:
                        player_scores[player_id] += 1
                        break
        else:
            voter_count = len(choice.get("voters", []))
            for author_name in choice.get("authors_names", []):
                for player_id, player in players.items():
                    if player.name == author_name:
                        player_scores[player_id] += voter_count * 2
                        break

    leaderboard = []
    for player_id, player in players.items():
        player.score += player_scores[player_id]
        leaderboard.append({
            "username": player.name,
            "score": player.score,
            "avatar_url": player.avatar_url,
        })

    leaderboard.sort(key=lambda item: item["score"], reverse=True)

    choices = []
    for choice in voting_choices:
        resolved_choice = choices_by_id[choice["id"]]
        choices.append({
            "id": resolved_choice["id"],
            "text": resolved_choice["text"],
            "authors_names": None if resolved_choice.get("is_correct") else resolved_choice.get("authors_names", []),
            "voters": resolved_choice.get("voters", []),
            "is_correct": resolved_choice.get("is_correct", False),
        })

    return {
        "choices": choices,
        "leaderboard": leaderboard,
    }

    
