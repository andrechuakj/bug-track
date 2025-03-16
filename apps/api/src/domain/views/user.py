from pydantic import BaseModel


class UserCreateRequestDto(BaseModel):
    name: str
    email: str
    password: str


class UserSummaryResponseDto(BaseModel):
    id: int
    name: str
    email: str
