from contextlib import ExitStack, asynccontextmanager
from typing import Any, Callable

from fastapi import FastAPI


def load_configurations(*configs: Callable[[FastAPI], Any]):
    @asynccontextmanager
    async def combined_config(app: FastAPI):
        with ExitStack() as stack:
            for config in configs:
                stack.enter_context(config(app))
            yield

    return combined_config


__all__ = ["load_configurations"]
