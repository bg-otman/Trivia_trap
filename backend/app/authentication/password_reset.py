"""Password recovery for the existing single-process development user store."""
import hashlib
import os
import secrets
import time
from urllib.parse import urlsplit

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr, Field, SecretStr, field_validator
from starlette.concurrency import run_in_threadpool

from authentication.mailer import send_email
from authentication.memory_store import TEST_USERS, find_user_by_email
from authentication.schemas import Password, RegisterData
from authentication.security import hash_password
from authentication.validation_route import AuthRoute

reset_router = APIRouter(route_class=AuthRoute)
RESET_SECONDS = 15 * 60
RESEND_SECONDS = 60
GENERIC_MESSAGE = "If an eligible account exists, a password reset email will be sent."


class ForgotPasswordData(BaseModel):
    email: EmailStr = Field(max_length=256)


class ResetPasswordData(BaseModel):
    token: SecretStr = Field(min_length=43, max_length=43)
    password: Password = Field(min_length=15, max_length=128)

    @field_validator("token")
    @classmethod
    def validate_token(cls, value: SecretStr) -> SecretStr:
        token = value.get_secret_value()
        if not token.isascii() or not all(c.isalnum() or c in "-_" for c in token):
            raise ValueError("Invalid reset token.")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: SecretStr) -> SecretStr:
        return RegisterData.validate_password_complexity(value)


@reset_router.post("/forgot-password", status_code=202)
async def forgot_password(data: ForgotPasswordData, background_tasks: BackgroundTasks):
    # Validate configuration for every request, without revealing account existence.
    reset_url = os.environ.get("PASSWORD_RESET_URL", "")
    try:
        url = urlsplit(reset_url)
        valid_url = (url.scheme in ("http", "https") and url.hostname
                     and not url.fragment and not url.username and not url.password)
    except ValueError:
        valid_url = False
    if not valid_url:
        raise HTTPException(503, "Password recovery is not configured.")
    user = find_user_by_email(data.email)
    now = time.time()
    if user and user.get("password_hash") and now >= user.get("reset_sent_at", 0) + RESEND_SECONDS:
        token = secrets.token_urlsafe(32)
        user["reset_digest"] = hashlib.sha256(token.encode()).hexdigest()
        user["reset_expires"] = now + RESET_SECONDS
        user["reset_sent_at"] = now
        # The frontend owns the form; never derive its URL from a request header.
        link = f"{reset_url}#token={token}"
        background_tasks.add_task(
            send_email, user["email"], "Reset your Trivia Trap password",
            f"Open this link to choose a new password:\n\n{link}\n\n"
            "This link expires in 15 minutes and can be used once.\n"
            "If you did not request this, ignore this email.",
        )
    return {"message": GENERIC_MESSAGE}


def find_reset_user(digest: str):
    return next((user for user in TEST_USERS
                 if secrets.compare_digest(user.get("reset_digest", ""), digest)
                 and user.get("reset_expires", 0) > time.time()), None)


@reset_router.post("/reset-password")
async def reset_password(data: ResetPasswordData, background_tasks: BackgroundTasks):
    digest = hashlib.sha256(data.token.get_secret_value().encode()).hexdigest()
    user = find_reset_user(digest)
    if user is None:
        raise HTTPException(400, "Invalid or expired reset link.")
    password_hash = await run_in_threadpool(hash_password, data.password.get_secret_value())
    # Recheck after awaiting: concurrent resets or resends may invalidate the link.
    if find_reset_user(digest) is not user:
        raise HTTPException(400, "Invalid or expired reset link.")
    user["password_hash"] = password_hash
    user.pop("reset_digest", None)
    user.pop("reset_expires", None)
    user["auth_version"] = user.get("auth_version", 0) + 1
    background_tasks.add_task(
        send_email, user["email"], "Your Trivia Trap password was changed",
        "Your password has been reset. Sign in with your new password.\n"
        "If you did not do this, reset your password immediately.",
    )
    return {"message": "Password reset. Sign in with your new password."}

