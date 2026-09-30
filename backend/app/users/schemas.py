from pydantic import BaseModel, Field, ConfigDict
from typing import Annotated


class UserStatistics(BaseModel):
    total_games: Annotated[int, Field(ge=0)]
    total_wins: Annotated[int, Field(ge=0)]
    total_points: Annotated[int, Field(ge=0)]
    high_score: Annotated[int, Field(ge=0)]

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

class User(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: Annotated[int, Field(ge=0)]
    username: Annotated[str, Field(min_length=1, max_length=15)]
    banner: Annotated[str, Field(min_length=3, max_length=50)]
    avatar: Annotated[str, Field(min_length=3, max_length=50)]
    joined_date: Annotated[str, Field(min_length=1, max_length=50)]
    stats: UserStatistics
    analytics: list[UserCategoryAnalytics]
    achievements: list[UserAchievements]