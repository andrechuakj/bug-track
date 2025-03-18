from domain.config import get_db
from domain.views.auth import LoginRequestDto, LoginResponseDto
from fastapi import APIRouter, Request
from internal.errors.client_errors import UnauthorizedError
from services.auth_service import AuthService
from services.user_service import UserService

router = APIRouter(prefix="/public/api/v1/auth", tags=["public_auth"])


@router.post("/login")
async def login(r: Request, dto: LoginRequestDto) -> LoginResponseDto:
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
    # TODO: Invalidate old refresh tokens
    return AuthService.create_user_tokens(user)
