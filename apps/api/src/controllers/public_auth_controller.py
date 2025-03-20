from domain.config import get_db
from domain.models.User import *
from domain.views.auth import AuthResponseDto, LoginRequestDto, SignupRequestDto
from fastapi import APIRouter, Request
from internal.errors.client_errors import (
    ConflictError,
    ForbiddenError,
    UnauthorizedError,
)
from services.auth_service import AuthService
from services.user_service import UserService

router = APIRouter(prefix="/public/api/v1/auth", tags=["public_auth"])


@router.post("/login")
async def login(r: Request, dto: LoginRequestDto) -> AuthResponseDto:
    """
    Authenticate a user with email/password and return a JWT pair
    for that user.
    """
    tx = get_db(r)
    user = UserService.get_user_by_email(tx, dto.email)
    if not user:
        raise UnauthorizedError(
            "Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not UserService.validate_user_password(user, dto.password):
        raise ForbiddenError(
            "Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # TODO: Invalidate old refresh tokens
    return AuthService.create_user_tokens(user)


@router.post("/signup")
async def signup(r: Request, dto: SignupRequestDto) -> AuthResponseDto:
    """
    Create a new user if email has not been used, and return a JWT pair
    for that user.
    """
    tx = get_db(r)
    existing_user = UserService.get_user_by_email(tx, dto.email)
    if existing_user:
        raise ConflictError("Email is already in use.")

    new_user = User(email=dto.email, password=dto.password, name=dto.name)
    user = UserService.create_user(tx, new_user)
    # TODO: Invalidate old refresh tokens
    return AuthService.create_user_tokens(user)
