from dataclasses import dataclass

from fastapi import HTTPException


@dataclass(frozen=True)
class BaseClientError(HTTPException):
    def __init__(self, status_code: int, detail: str, **kwargs):
        super().__init__(status_code=status_code, detail=detail, **kwargs)
        self.status_code = status_code
        self.detail = detail


class BadRequestError(BaseClientError):
    def __init__(self, detail: str, /, **kwargs):
        super().__init__(400, detail, **kwargs)


class UnauthorizedError(BaseClientError):
    def __init__(self, detail: str, /, **kwargs):
        super().__init__(401, detail, **kwargs)


class ForbiddenError(BaseClientError):
    def __init__(self, detail: str, /, **kwargs):
        super().__init__(403, detail, **kwargs)


class NotFoundError(BaseClientError):
    def __init__(self, detail: str, /, **kwargs):
        super().__init__(404, detail, **kwargs)


class MethodNotAllowedError(BaseClientError):
    def __init__(self, detail: str, /, **kwargs):
        super().__init__(405, detail, **kwargs)


class UnprocessableEntityError(BaseClientError):
    def __init__(self, detail: str, /, **kwargs):
        super().__init__(422, detail, **kwargs)


__all__ = [
    "BadRequestError",
    "UnauthorizedError",
    "ForbiddenError",
    "NotFoundError",
    "MethodNotAllowedError",
    "UnprocessableEntityError",
]
