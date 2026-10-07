from fastapi import APIRouter, Depends, Query
from dataProcessing.database import get_db
from authentication.current_user import get_current_user
from dataProcessing.models import User
from sqlalchemy.orm import Session
from typing import Annotated
from users.utils import build_user_profile
from .schemas import UserProfile


router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(get_current_user)])


def validate_language(language: str = Query('en', min_length=2, max_length=2)) -> str:
    if language not in ['en', 'ar']:
        language = 'en'
    return language

@router.get("/me")
async def get_profile(db: Annotated[Session, Depends(get_db)], 
                    current_user: Annotated[User, Depends(get_current_user)],
                    language: Annotated[str, Depends(validate_language)]) -> UserProfile:
    return await build_user_profile(
            db, 
            user_id=current_user.id,
            language=language
        )
    


@router.get("/{username}")
async def get_user_profile(username: str, 
                           db: Annotated[Session, Depends(get_db)],
                           language: Annotated[str, Depends(validate_language)]) -> UserProfile:
    return await build_user_profile(
            db, 
            username=username,
            language=language
        )
