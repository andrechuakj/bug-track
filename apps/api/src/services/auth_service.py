from datetime import datetime, timedelta, timezone

import jwt
from domain.models.User import User
from internal.errors.client_errors import ForbiddenError, UnauthorizedError
from pydantic import BaseModel
from utilities.constants import constants


class _AuthService:
    _ALGORITHM = "HS256"
    _ACCESS_TOKEN_VALID_DURATION = timedelta(minutes=15)
    _REFRESH_TOKEN_VALID_DURATION = timedelta(days=1)

    def _verify_token(self, token: str) -> dict:
        """Verify the JWT token and return the payload"""
        try:
            return jwt.decode(
                token,
                constants.JWT_SECRET_KEY,
                algorithms=[_AuthService._ALGORITHM],
            )
        except jwt.ExpiredSignatureError:
            raise ForbiddenError("Token expired.")
        except jwt.InvalidTokenError:
            raise UnauthorizedError("Invalid token.")

    def is_access_token(self, token: str) -> bool:
        """Check if the token is an access OR refresh token"""
        payload = self._verify_token(token)
        match payload.get("token_type"):
            case "access", "refresh":
                return True
            case _:
                return False

    def is_refresh_token(self, token: str) -> bool:
        """Check if the token is a refresh token"""
        payload = self._verify_token(token)
        return payload.get("token_type") == "refresh"

    class TokensViewModel(BaseModel):
        access_token: str
        refresh_token: str

    def create_user_tokens(self, user: User) -> TokensViewModel:
        """Generate a JWT token"""
        data = {
            "sub": user.email,
            "id": user.id,
            "name": user.name,
        }
        access_token = {
            **data,
            "exp": datetime.now(timezone.utc)
            + _AuthService._ACCESS_TOKEN_VALID_DURATION,
            "token_type": "access",
        }
        refresh_token = {
            **data,
            "exp": datetime.now(timezone.utc)
            + _AuthService._REFRESH_TOKEN_VALID_DURATION,
            "token_type": "refresh",
        }
        return _AuthService.TokensViewModel(
            access_token=jwt.encode(
                access_token,
                constants.JWT_SECRET_KEY,
                algorithm=_AuthService._ALGORITHM,
            ),
            refresh_token=jwt.encode(
                refresh_token,
                constants.JWT_SECRET_KEY,
                algorithm=_AuthService._ALGORITHM,
            ),
        )

    def refresh_user_tokens(self, refresh_token_str: str) -> TokensViewModel:
        """Refresh the user's access token"""
        if not self.is_refresh_token(refresh_token):
            raise ForbiddenError("Invalid token type.")
        refresh_token = self._verify_token(refresh_token_str)
        new_access_token = {
            **refresh_token,
            "exp": datetime.now(timezone.utc)
            + _AuthService._ACCESS_TOKEN_VALID_DURATION,
            "token_type": "access",
        }
        return _AuthService.TokensViewModel(
            access_token=jwt.encode(
                new_access_token,
                constants.JWT_SECRET_KEY,
                algorithm=_AuthService._ALGORITHM,
            ),
            refresh_token=refresh_token_str,
        )


AuthService = _AuthService()

__all__ = ["AuthService"]
