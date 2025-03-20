import re

from configuration.logger import get_logger
from fastapi import Request
from internal.errors import create_client_error_response as error
from internal.errors.client_errors import (
    BaseClientError,
    ForbiddenError,
    UnauthorizedError,
)
from services.auth_service import AuthService

secured_endpoints_regex = re.compile(r"^/api/v1/.*")


async def secured_endpoints_middleware(request: Request, call_next):
    logger = get_logger()
    # Don't check OPTIONS preflight requests
    if request.method == "OPTIONS":
        return await call_next(request)
    if not re.match(secured_endpoints_regex, request.url.path):
        logger.info(f"Public Endpoint: {request.url.path}")
        return await call_next(request)
    logger.info(f"Secured Endpoint: {request.url.path}")
    token = request.headers.get("Authorization")
    if not token:
        logger.warning("No token provided")
        return error(request, UnauthorizedError("Missing access token"))
    if not token.startswith("Bearer "):
        logger.warning("Invalid token format")
        return error(request, ForbiddenError("Invalid token format"))
    token = token.replace("Bearer ", "")
    try:
        if not AuthService.is_access_token(token):
            logger.warning("Invalid token type")
            return error(request, ForbiddenError("Invalid token"))
    except BaseClientError as e:
        logger.error(f"Error validating token: {e}")
        return error(request, e)
    except Exception as e:
        # Don't expose internal errors to the client
        logger.error(f"Error validating token: {e}")
        return error(request, ForbiddenError("Invalid token"))
    return await call_next(request)
