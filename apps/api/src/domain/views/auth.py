from pydantic import BaseModel, EmailStr, Field
from utilities.views import BaseResponseModel


class LoginRequestDto(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class SignupRequestDto(BaseModel):
    email: EmailStr
    name: str
    password: str = Field(min_length=10)


class AuthResponseDto(BaseResponseModel):
    access_token: str
    refresh_token: str
