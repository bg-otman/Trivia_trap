from typing import Annotated

from password_validator import PasswordValidator
from pydantic import AfterValidator, BaseModel, EmailStr, Field, SecretStr, field_validator


password_policy = (
    PasswordValidator()
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().symbols()
    .has().no().spaces()
)


def validate_password_encoding(value: SecretStr) -> SecretStr:
    try:
        value.get_secret_value().encode("utf-8")
    except UnicodeEncodeError:
        raise ValueError("Password must contain valid Unicode characters.") from None
    return value


Password = Annotated[SecretStr, AfterValidator(validate_password_encoding)]


class UsernameData(BaseModel):
    # Match the room player's maximum name length.
    username: str = Field(min_length=3, max_length=15)

    @field_validator("username")
    @classmethod
    def validate_username(cls, username: str) -> str:
        if not username[0].isalpha() or not username.isalnum():
            raise ValueError(
                "Username must start with a letter and contain only letters and numbers."
            )
        return username


class RegisterData(UsernameData):
    email: EmailStr = Field(max_length=255)
    password: Password = Field(min_length=15, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, value: SecretStr) -> SecretStr:
        if not password_policy.validate(value.get_secret_value()):
            raise ValueError(
                "Password must contain at least one uppercase letter, "
                "one lowercase letter, one digit, and one symbol, "
                "and must not contain spaces."
            )
        return value


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr

class LoginData(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: Password = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
