from dataclasses import dataclass

from fastapi import HTTPException


@dataclass(frozen=True)
class BaseClientError(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)
        self.status_code = status_code
        self.detail = detail


class BadRequestError(BaseClientError):
    def __init__(self, detail: str):
        super().__init__(400, detail)


class UnauthorizedError(BaseClientError):
    def __init__(self, detail: str):
        super().__init__(401, detail)


class ForbiddenError(BaseClientError):
    def __init__(self, detail: str):
        super().__init__(403, detail)


class NotFoundError(BaseClientError):
    def __init__(self, detail: str):
        super().__init__(404, detail)


class MethodNotAllowedError(BaseClientError):
    def __init__(self, detail: str):
        super().__init__(405, detail)


class UnprocessableEntityError(BaseClientError):
    def __init__(self, detail: str):
        super().__init__(422, detail)


__all__ = [
    'BadRequestError',
    'UnauthorizedError',
    'ForbiddenError',
    'NotFoundError',
    'MethodNotAllowedError',
    'UnprocessableEntityError',
]
