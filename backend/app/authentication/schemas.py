from password_validator import PasswordValidator
from pydantic import BaseModel, EmailStr, Field, SecretStr, field_validator


password_policy = (
    PasswordValidator()
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().symbols()
    .has().no().spaces()
)


class RegisterData(BaseModel):
    email: EmailStr = Field(max_length=256)
    username: str = Field(min_length=3, max_length=30)
    password: SecretStr = Field(min_length=15, max_length=128)

    # validate the username start with character and only contain letters and numbers
    @field_validator("username")
    @classmethod
    def validate_username(cls, username: str) -> str:
        if not username[0].isalpha() or not username.isalnum():
            raise ValueError(
                "Username must start with a letter and contain only letters and numbers."
            )
        return username
    # validate the password complexity
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
    id: int
    username: str
    email: EmailStr
