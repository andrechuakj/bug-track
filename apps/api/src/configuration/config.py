from contextlib import ExitStack, asynccontextmanager
from typing import Any, Callable

from fastapi import FastAPI


def load_configurations(
    *configs: Callable[[FastAPI], Any], post_config_hook: Callable[[], None] = None
):
    @asynccontextmanager
    async def combined_config(app: FastAPI):
        with ExitStack() as stack:
            for config in configs:
                stack.enter_context(config(app))
            if post_config_hook:
                post_config_hook()
            yield

    return combined_config


__all__ = ["load_configurations"]
