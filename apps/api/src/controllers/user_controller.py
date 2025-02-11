from typing import Sequence

from domain.models.User import User
from domain.views.user import UserCreateRequestDto, UserSummaryResponseDto
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from services.user_service import UserService

router = APIRouter(prefix='/api/v1/users', tags=['users'])


@router.get('/')
async def get_all_users() -> Sequence[UserSummaryResponseDto]:
    return UserService.get_users()


@router.get('/{user_id}')
async def get_single_user(user_id: int, request: Request) -> UserSummaryResponseDto:
    user = UserService.get_user(user_id)
    if user is None:
        raise NotFoundError('User not found')
    return user


@router.post('/')
async def create_user(dto: UserCreateRequestDto) -> UserSummaryResponseDto:
    user_to_create = User(**dto.model_dump())
    return UserService.save_user(user_to_create)


@router.delete('/{user_id}')
async def delete_user(user_id: int) -> UserSummaryResponseDto:
    return UserService.delete_user(user_id)

__all__ = ['router']
