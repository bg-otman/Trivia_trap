from dataProcessing.models import User
from authentication.repository import find_user_by_username
from authentication.schemas import validate_username
from sqlalchemy.orm import Session
from sqlalchemy import select, func, case
from typing import Annotated
from fastapi import Depends
from dataProcessing.database import get_db
from dataProcessing.models import User, GamePlayerResult, UserAchievement, CategoryTranslation, GamePlayerCategoryResult
from .schemas import UserStatistics, UserProfile, UserAchievements as achievements, UserCategoryAnalytics
from fastapi import HTTPException, status


async def get_user_statistics(db: Annotated[Session, Depends(get_db)], user_id: int) -> UserStatistics:
    user_stats = UserStatistics()
    statement = select(
        func.count(GamePlayerResult.user_id).label("total_games"),
        func.sum(case((GamePlayerResult.final_rank == 1, 1), else_= 0)).label("total_wins"),
        func.sum(GamePlayerResult.final_score).label("total_points"),
        func.max(GamePlayerResult.final_score).label("high_score")
    ).where(GamePlayerResult.user_id == user_id)

    try:
        stats = (await db.execute(statement)).first()
        user_stats.total_games = stats.total_games or 0
        user_stats.total_wins = stats.total_wins or 0
        user_stats.total_points = stats.total_points or 0
        user_stats.high_score = stats.high_score or 0
    except Exception:
        pass
    return user_stats



async def get_user_achievements(db: Annotated[Session, Depends(get_db)], user_id: int):
    user_achievements = []
    statement = select(UserAchievement).where(UserAchievement.user_id == user_id)
    try:
        trophies = (await db.execute(statement)).scalars().all()
        for trophy in trophies:
            user_achievements.append(achievements(
                name=trophy.achievement_code,
                description=trophy.description,
                img=trophy.img,
                unlocked=trophy.unlocked
            ))
    except Exception:
        pass
    return user_achievements




async def get_user_category_analytics(db: Annotated[Session, Depends(get_db)], user_id: int, language: str = 'en') -> list[UserCategoryAnalytics]:
    category_analytics = []
    player_counts = (
        select(
            GamePlayerResult.game_id,
            func.count(GamePlayerResult.user_id).label("player_count"),
        )
        .group_by(GamePlayerResult.game_id)
        .subquery()
    )
    statement = select(
        CategoryTranslation.name.label("category"),
        func.sum(GamePlayerCategoryResult.questions_played).label("total_rounds"),
        func.sum(GamePlayerCategoryResult.correct_answers).label("correct_answers"),
        func.sum(GamePlayerCategoryResult.bluff_votes_received).label("bluff_votes_received"),
        func.sum(
            GamePlayerCategoryResult.questions_played
            * (player_counts.c.player_count - 1)
        ).label("player_count"),
    ).join(
        CategoryTranslation, GamePlayerCategoryResult.category_id == CategoryTranslation.category_id
    ).join(
        player_counts, GamePlayerCategoryResult.game_id == player_counts.c.game_id
    ).where(
        GamePlayerCategoryResult.user_id == user_id,
        CategoryTranslation.language_code == language
    ).group_by(
        CategoryTranslation.name
    ).order_by(
        func.sum(GamePlayerCategoryResult.questions_played).desc(),
        func.sum(GamePlayerCategoryResult.correct_answers).desc(),
        func.sum(GamePlayerCategoryResult.bluff_votes_received).desc()
    ).limit(5)
    try:
        results = (await db.execute(statement)).all()
        for row in results:
            category_analytics.append(UserCategoryAnalytics(
                category=row.category,
                total_rounds=row.total_rounds,
                knowledge_accuracy=(row.correct_answers / row.total_rounds) * 100 if row.total_rounds > 0 else 0.0,
                bluff_efficiency=(
                    row.bluff_votes_received / row.player_count
                ) * 100 if row.player_count > 0 else 0.0
            ))
    except Exception:
        pass
    return category_analytics



async def build_user_profile(session: Annotated[Session, Depends(get_db)], 
                   user_id: int = None, 
                   username: str = None,
                   language: str = 'en') -> UserProfile:
    """
        builds a user profile based on the provided user_id or username.
        If both are provided, user_id takes precedence.
    """
    user = None
    try:
        if user_id is not None:
            user = await session.get(User, user_id)
        elif username is not None:
            user = await find_user_by_username(session, username)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserProfile(
        id=user.id,
        username=user.username,
        banner=user.cover_url,
        avatar=user.avatar_url,
        joined_date=user.created_at,
        stats=await get_user_statistics(session, user.id),
        achievements=await get_user_achievements(session, user.id),
        analytics=await get_user_category_analytics(session, user.id, language)
    )


async def update_user_profile(
        session: Annotated[Session, Depends(get_db)], 
        user_id: int, 
        avatar_url: str, 
        username: str
    ) -> None:
    """
        Updates the avatar URL of a user in the database.
    """
    try:
        user = await session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        user.avatar_url = avatar_url
        user.username = validate_username(username)
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}",
        )