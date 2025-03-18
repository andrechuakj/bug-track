from contextlib import contextmanager

import openai
from configuration.logger import get_logger
from fastapi import FastAPI
from utilities.constants import constants


@contextmanager
def configure_openai(app: FastAPI):
    """
    Configures OpenAI for the application.
    """
    logger = get_logger()
    key = constants.OPENAI_API_KEY
    hashed = "*" * len(key)
    hashed = f"{key[:5]}{hashed[5:-5]}{key[-5:]}"
    logger.info(f"Configuring OpenAI with API key: {hashed}")
    openai.api_key = key
    logger.info("OpenAI configured")
    yield


__all__ = ["configure_openai"]
