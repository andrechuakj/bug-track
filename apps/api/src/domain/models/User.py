from datetime import datetime

from domain.helpers.Timestampable import Timestampable
from internal.errors import NotFoundError
from sqlmodel import Field, Session, SQLModel, select


class User(SQLModel, Timestampable, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    password: str = Field(repr=False)


def get_users(tx: Session):
    return tx.exec(select(User)).all()


def get_user_by_id(tx: Session, user_id: int):
    return tx.get(User, user_id)


def get_user_by_email(tx: Session, email: str):
    return tx.exec(select(User).where(User.email == email)).first()


def save_user(tx: Session, user: User):
    user.updated_at = datetime.now()
    tx.add(user)
    tx.commit()
    return user


def delete_user(tx: Session, user_id: int):
    user = get_user_by_id(tx, user_id)
    if not user:
        raise NotFoundError(f"User {user_id} not found")
    tx.delete(user)
    tx.commit()
    return user
