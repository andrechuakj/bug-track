from sqlalchemy.orm import sessionmaker
from sqlmodel import Session, SQLModel, create_engine

# Use in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite://"


def create_test_database():
    """
    Mock the database for testing, using an in-memory SQLite database.
    """
    engine = create_engine(TEST_DATABASE_URL, echo=True)
    SQLModel.metadata.create_all(engine)
    generate_session = sessionmaker(
        bind=engine,
        class_=Session,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )
    return generate_session


__all__ = ["create_test_database"]
