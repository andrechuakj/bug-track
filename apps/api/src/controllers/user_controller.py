from typing import Sequence

from domain.config import get_db
from domain.models.User import User
from domain.views.user import UserCreateRequestDto, UserSummaryResponseDto
from fastapi import APIRouter, Request
from fastapi.security import OAuth2PasswordBearer
from internal.errors import NotFoundError
from internal.errors.client_errors import ConflictError
from services.user_service import UserService

router = APIRouter(prefix="/api/v1/users", tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")


@router.get("/")
async def get_all_users(r: Request) -> Sequence[UserSummaryResponseDto]:
    tx = get_db(r)
    return UserService.get_users(tx)


@router.get("/{user_id}")
async def get_single_user(user_id: int, r: Request) -> UserSummaryResponseDto:
    tx = get_db(r)
    user = UserService.get_user(tx, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


@router.post("/")
async def create_user(dto: UserCreateRequestDto, r: Request) -> UserSummaryResponseDto:
    tx = get_db(r)
    user = UserService.get_user_by_email(tx, dto.email)
    if user:
        raise ConflictError("User with this email already exists")

    user_to_create = User(**dto.model_dump())
    return UserService.save_new_user(tx, user_to_create)


@router.delete("/{user_id}")
async def delete_user(user_id: int, r: Request) -> UserSummaryResponseDto:
    tx = get_db(r)
    return UserService.delete_user(tx, user_id)


__all__ = ["router"]
