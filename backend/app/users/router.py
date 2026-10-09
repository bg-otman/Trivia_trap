from fastapi import APIRouter, Depends, Query, File, Form, UploadFile, HTTPException, status
from dataProcessing.database import get_db
from authentication.current_user import get_current_user
from dataProcessing.models import User
from sqlalchemy.orm import Session
from typing import Annotated
from users.utils import build_user_profile, update_user_profile
from .schemas import UserProfile
import os


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



UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

@router.post("/me/upload")
async def upload_profile(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    username: str = Form(...),
    file: UploadFile = File(...),
):
    """
        Upload a profile avatar for the current user.
        stores the file in the 'uploads' directory with a safe filename: {user_id}_avatar.{extension}.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types are: {', '.join(ALLOWED_MIME_TYPES)}"
        )

    file_size = file.size
    if file_size and file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large. Maximum allowed size is 5MB."
        )

    prefix = "".join(c for c in str(user.id) if c.isalnum() or c in ("-", "_")).strip()
    file_extension = os.path.splitext(file.filename)[1]
    safe_filename = f"{prefix}_avatar{file_extension}"
    
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # Read in chunks of 1MB
                buffer.write(chunk)
    finally:
        await file.close()
    await update_user_profile(db, user.id, file_path, username)
    return {
        "status": "success",
        "username": username,
        "filename": safe_filename,
        "size_bytes": file_size
    }
