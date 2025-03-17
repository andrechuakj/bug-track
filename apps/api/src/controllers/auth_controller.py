from datetime import timedelta

from domain.config import get_db
from domain.views.auth import LoginRequest, LoginResponse
from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from internal.errors.client_errors import UnauthorizedError
from services.auth_service import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    create_refresh_token,
    verify_access_token,
    verify_password,
)
from services.user_service import UserService
from sqlmodel import Session

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/token")


def authenticate_user(tx: Session, email: str, password: str):
    """Helper function to authenticate a user."""
    users = UserService.get_users(tx)
    user = next((u for u in users if u.email == email), None)

    if not user or not verify_password(password, user.password):
        raise UnauthorizedError(
            "Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


@router.post("/token", response_model=LoginResponse)
async def login_with_token(request: Request, login_request: LoginRequest):
    """
    Authenticate a user with email/password and return a JWT token
    """
    tx: Session = get_db(request)
    user = authenticate_user(tx, login_request.email, login_request.password)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    user_data = {"sub": user.email, "id": user.id, "name": user.name}
    access_token = create_access_token(
        data=user_data,
        expires_delta=access_token_expires,
    )

    # Create refresh token
    refresh_token = create_refresh_token(data=user_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh")
async def refresh_access_token(request: Request, token: str = Depends(oauth2_scheme)):
    """
    Use a refresh token to generate a new access token
    """
    try:
        payload = verify_access_token(token)

        # Verify this is a refresh token
        if payload.get("token_type") != "refresh":
            raise UnauthorizedError(
                "Invalid token type", headers={"WWW-Authenticate": "Bearer"}
            )

        # Create new access token only
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": payload["sub"], "id": payload["id"], "name": payload["name"]},
            expires_delta=access_token_expires,
        )

        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise UnauthorizedError(
            "Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )


__all__ = ["router"]
