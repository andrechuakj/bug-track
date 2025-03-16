from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .client_errors import BaseClientError


class ErrorModel(BaseModel):
    timestamp: datetime
    path: str
    status: int
    error: str


def register_error_handler(app: FastAPI) -> None:
    @app.exception_handler(BaseClientError)
    async def client_error_handler(request: Request, exc: BaseClientError):
        return JSONResponse(
            content=jsonable_encoder(
                ErrorModel(
                    timestamp=datetime.now(),
                    path=request.url.path,
                    status=exc.status_code,
                    error=exc.detail,
                )
            ),
            status_code=exc.status_code,
        )


# Reexport the various error classes
from .client_errors import *  # noqa
