import unicodedata
from sqlalchemy import exists, func, select
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
            exists().where(
                Question.category_id == Category.id,
                Question.language_code == language_code,
            ),
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


def prepare_voting_choices(
    voting_choices: list[dict],
) -> dict[str, dict]:
    if not voting_choices:
        raise ValueError("Voting choices are missing")

    choices_by_id = {
        choice["id"]: {
            **choice,
            "author_ids": list(
                choice.get("author_ids", [])
            ),
            "voter_ids": [],
        }
        for choice in voting_choices
    }

    correct_choices = [
        choice
        for choice in choices_by_id.values()
        if choice.get("is_correct")
    ]

    if len(correct_choices) != 1:
        raise ValueError(
            "Voting choices must contain one correct answer"
        )

    return choices_by_id


def calculate_player_stats(
    votes: dict[str, str],
    players: dict[str, "PlayerInfo"],
    choices_by_id: dict[str, dict],
) -> dict[str, dict]:
    player_stats = {
        player_id: {
            "correct_votes": 0,
            "bluff_votes_received": 0,
            "round_points": 0,
        }
        for player_id in players
    }

    for voter_id, choice_id in votes.items():
        choice = choices_by_id.get(choice_id)

        if voter_id not in players or choice is None:
            continue

        choice["voter_ids"].append(voter_id)

        if choice["is_correct"]:
            player_stats[voter_id]["correct_votes"] += 1
        else:
            for author_id in choice["author_ids"]:
                if author_id in player_stats:
                    player_stats[author_id][
                        "bluff_votes_received"
                    ] += 1

    for stats in player_stats.values():
        stats["round_points"] = (
            stats["correct_votes"] * 1
            + stats["bluff_votes_received"] * 2
        )

    return player_stats


def build_results_payload(
    choices_by_id: dict[str, dict],
    player_stats: dict[str, dict],
    players: dict[str, "PlayerInfo"],
) -> dict:
    # Python's sort is stable, so equal scores retain the room's established
    # player insertion order. This is also the deterministic initial ranking
    # for round one when every player starts on the same score.
    previous_order = sorted(
        players.items(),
        key=lambda item: item[1].score,
        reverse=True,
    )
    previous_ranks = {
        player_id: index + 1
        for index, (player_id, _player) in enumerate(previous_order)
    }
    leaderboard = []

    for player_id, player in players.items():
        round_points = player_stats[player_id]["round_points"]
        player.score += round_points

        leaderboard.append({
            "player_id": player_id,
            "username": player.name,
            "score": player.score,
            "round_points": round_points,
            "avatar_url": player.avatar_url,
        })

    leaderboard.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    for current_rank, entry in enumerate(leaderboard, start=1):
        entry["rank"] = current_rank
        entry["rank_change"] = (
            previous_ranks[entry["player_id"]] - current_rank
        )

    result_choices = []
    for choice in choices_by_id.values():
        authors_names = [
            players[author_id].name
            for author_id in choice["author_ids"]
            if author_id in players
        ]

        voters_names = [
            players[voter_id].name
            for voter_id in choice["voter_ids"]
            if voter_id in players
        ]

        result_choices.append({
            "id": choice["id"],
            "text": choice["text"],
            "authors_names": (
                None
                if choice["is_correct"]
                else authors_names
            ),
            "voters": voters_names,
            "is_correct": choice["is_correct"],
        })

    return {
        "choices": result_choices,
        "leaderboard": leaderboard,
    }

def calculate_results(
    votes: dict[str, str],
    players: dict[str, "PlayerInfo"],
    voting_choices: list[dict],
) -> dict | tuple[dict, dict[str, dict], dict[str, dict]]:
    choices_by_id = prepare_voting_choices(
        voting_choices
    )

    player_stats = calculate_player_stats(
        votes=votes,
        players=players,
        choices_by_id=choices_by_id,
    )

    results = build_results_payload(
        choices_by_id=choices_by_id,
        player_stats=player_stats,
        players=players,
    )
    # if include_details:
    return results, player_stats, choices_by_id
    # return results
