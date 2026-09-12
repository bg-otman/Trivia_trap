from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field, SecretStr, field_validator
from password_validator import PasswordValidator

auth_router = APIRouter(prefix="/auth", tags=["AUTH"])

schema = (
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

    @field_validator("username")
    @classmethod
    def validate_username(cls, username: str) -> str:
        if not username[0].isalpha() or not username.isalnum():
            raise ValueError(
                "Username must start with a letter and contain only letters and numbers."
            )
        return username

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, value: SecretStr) -> SecretStr:
        if not schema.validate(value.get_secret_value()):
            raise ValueError(
                "Password must contain at least one uppercase letter, "
                "one lowercase letter, one digit, and one symbol, "
                "and must not contain spaces."
            )

        return value


@auth_router.post("/register")
def register(data: RegisterData):
    print(data.username)
    print(data.email)
    print(data.password) #print secret password .get_secret_value()
    # Input has passed validation.
    # Next: check for an existing user, hash the password,
    # and save the user to the database.
    return {"message": "Registration endpoint received the data"}
