from typing import Sequence

from domain.config import get_db
from domain.models.User import User
from domain.views.user import UserCreateRequestDto, UserSummaryResponseDto
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from internal.errors import NotFoundError
from internal.errors.client_errors import ConflictError
from services.auth_service import verify_access_token
from services.user_service import UserService

router = APIRouter(prefix="/api/v1/users", tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """Extract user data from JWT token"""
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return payload


@router.get("/")
async def get_all_users(
    r: Request, current_user: dict = Depends(get_current_user)
) -> Sequence[UserSummaryResponseDto]:
    tx = get_db(r)
    return UserService.get_users(tx)


@router.get("/{user_id}")
async def get_single_user(
    user_id: int, r: Request, current_user: dict = Depends(get_current_user)
) -> UserSummaryResponseDto:
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
    return UserService.save_user(tx, user_to_create)


@router.delete("/{user_id}")
async def delete_user(
    user_id: int, r: Request, current_user: dict = Depends(get_current_user)
) -> UserSummaryResponseDto:
    tx = get_db(r)
    return UserService.delete_user(tx, user_id)


__all__ = ["router"]
