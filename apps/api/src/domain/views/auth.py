from pydantic import BaseModel


class LoginRequestDto(BaseModel):
    email: str
    password: str


class LoginResponseDto(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
