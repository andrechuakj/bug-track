from pydantic import BaseModel, EmailStr, Field
from utilities.views import BaseResponseModel


class LoginRequestDto(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10)


class LoginResponseDto(BaseResponseModel):
    access_token: str
    refresh_token: str
