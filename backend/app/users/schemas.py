from datetime import datetime
from pydantic import BaseModel, Field
from typing import Annotated


class UserStatistics(BaseModel):
    total_games: Annotated[int, Field(ge=0)] = 0
    total_wins: Annotated[int, Field(ge=0)] = 0
    total_points: Annotated[int, Field(ge=0)] = 0
    high_score: Annotated[int, Field(ge=0)] = 0

class UserCategoryAnalytics(BaseModel):
    category: Annotated[str, Field(min_length=1, max_length=50)]
    total_rounds: Annotated[int, Field(ge=0)]
    knowledge_accuracy: Annotated[float, Field(ge=0)]
    bluff_efficiency: Annotated[float, Field(ge=0)]

class UserAchievements(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=50)]
    description: Annotated[str, Field(min_length=1, max_length=100)]
    img: Annotated[str, Field(min_length=3, max_length=50)]
    unlocked: bool = False

class UserProfile(BaseModel, arbitrary_types_allowed=True):
    id: Annotated[int, Field(ge=0)]
    username: Annotated[str, Field(min_length=1, max_length=15)]
    banner: Annotated[str | None, Field(min_length=3)] = None
    avatar: Annotated[str | None, Field(min_length=3)] = None
    joined_date: datetime
    stats: UserStatistics
    achievements: list[UserAchievements]
    analytics: list[UserCategoryAnalytics]