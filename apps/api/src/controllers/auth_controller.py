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


@router.post("/signup")
async def signup_user(r: Request, body: SignupRequest) -> AuthResponse:
    """
    Create a new user if email has not been used, and return a JWT token
    """
    tx: Session = get_db(r)

    # Check if user already exists
    existing_user = UserService.get_user_by_email(tx, body.email)
    if existing_user:
        raise ConflictError(
            "Email is already in use.",
        )

    # create new user
    new_user = User(email=body.email, password=body.password, name=body.name)
    user = UserService.create_user(tx, new_user)

    # Prepare token payload information
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    user_data = {"sub": user.email, "id": user.id, "name": user.name}
    access_token = create_access_token(
        data=user_data,
        expires_delta=access_token_expires,
    )

    # Create refresh token
    refresh_token = create_refresh_token(data=user_data)
    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


__all__ = ["router"]
