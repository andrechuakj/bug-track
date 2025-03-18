from typing import Callable

from fastapi import FastAPI, Request, Response


def register_custom_middleware(
    app: FastAPI, *middleware: Callable[[Request, Callable], Response]
) -> None:
    """
    Middleware that allows for the registration of multiple middleware functions.
    Functions are applied in the order they are passed in.
    """

    @app.middleware("http")
    async def combined_middleware(request: Request, call_next):
        call_chain = call_next

        def create_call_closure(middleware, call_chain):
            return lambda request: middleware(request, call_chain)

        for middleware_fn in middleware[::-1]:
            call_chain = create_call_closure(middleware_fn, call_chain)
        return await call_chain(request)
