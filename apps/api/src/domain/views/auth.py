from pydantic import BaseModel, EmailStr, Field
from utilities.views import BaseResponseModel


class LoginRequestDto(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10)


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class SignupRequest(BaseModel):
    email: str
    name: str
    password: str


class LoginResponseDto(BaseResponseModel):
    access_token: str
    refresh_token: str
