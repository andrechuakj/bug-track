from pydantic import BaseModel, EmailStr, Field
from utilities.views import BaseResponseModel


class LoginRequestDto(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10)


class SignupRequestDto(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=10)


class AuthResponseDto(BaseResponseModel):
    access_token: str
    refresh_token: str
    user_id: int
