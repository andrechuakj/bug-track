from domain.views.auth import LoginResponseDto
from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from internal.errors.client_errors import ForbiddenError
from services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="public/api/v1/auth/login")


@router.post("/refresh")
async def refresh_access_token(
    request: Request,
    token: str = Depends(oauth2_scheme),
) -> LoginResponseDto:
    """
    Use a refresh token to generate a new access token.
    """
    if not AuthService.is_refresh_token(token):
        raise ForbiddenError(
            "Invalid token type", headers={"WWW-Authenticate": "Bearer"}
        )

    return AuthService.refresh_user_tokens(token)


__all__ = ["router"]
