from typing import Generator

from fastapi import Depends, Request
from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, create_engine
from utilities.constants import constants

engine = create_engine(constants.DATABASE_URL, echo=constants.IS_DEVELOPMENT)
session = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


def _create_session() -> Generator[Session, None, None]:
    with session() as s:
        yield s


def db_txn_manager_generator(
    request: Request, session: Session = Depends(_create_session)
):
    request.state.db = session


def get_db(request: Request) -> Session:
    return request.state.db


__all__ = [
    "engine",
    "db_txn_manager_generator",
    "get_db",
]
