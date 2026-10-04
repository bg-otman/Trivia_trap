from dataProcessing.models import User
from sqlalchemy.orm import Session
from sqlalchemy import select, func, case
from typing import Annotated
from fastapi import Depends
from dataProcessing.database import get_db
from dataProcessing.models import User, GamePlayerResult
from .schemas import UserStatistics, UserProfile
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


async def build_user_profile(session: Annotated[Session, Depends(get_db)], 
                   user_id: int = None, 
                   username: str = None) -> UserProfile:
    "get user by id or username"
    user = None
    try:
        if user_id is not None:
            user = await session.get(User, user_id)
        elif username is not None:
            statement = select(User).where(User.username == username)
            user = await session.scalar(statement)
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
        stats=await get_user_statistics(session, user.id)
    )
