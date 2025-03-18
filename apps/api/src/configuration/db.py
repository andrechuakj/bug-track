from contextlib import contextmanager

from configuration.logger import get_logger
from domain.config import engine
from fastapi import FastAPI
from sqlmodel import SQLModel


@contextmanager
def configure_database(app: FastAPI):
    """
    Configures the database for the application.
    """
    logger = get_logger()
    logger.info(f"Initializing database engine for application: {app.title}")
    SQLModel.metadata.create_all(engine)
    logger.info("Database engine initialized")
    yield
    logger.info("Closing database engine")
    engine.dispose()


__all__ = ["configure_database"]
