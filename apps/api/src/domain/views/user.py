from pydantic import BaseModel
from utilities.views import BaseResponseModel


class UserCreateRequestDto(BaseModel):
    name: str
    email: str
    password: str


class UserSummaryResponseDto(BaseResponseModel):
    id: int
    name: str
    email: str
