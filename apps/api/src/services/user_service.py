from typing import Sequence

from domain.models.User import *
from internal.errors import NotFoundError
from passlib.context import CryptContext
from utilities.classes import Service


class _UserService(Service):
    _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def get_users(self, tx: Session) -> Sequence[User]:
        return get_users(tx)

    def get_user(self, tx: Session, user_id: int):
        return get_user_by_id(tx, user_id)

    def get_user_by_email(self, tx: Session, email: str):
        return get_user_by_email(tx, email)

    def save_new_user(self, tx: Session, user: User):
        user.password = _UserService._pwd_context.hash(user.password)
        return save_user(tx, user)

    def delete_user(self, tx: Session, user_id: int):
        user = self.get_user(tx, user_id)
        if user is None:
            raise NotFoundError("User not found")
        return delete_user(tx, user_id)

    def validate_user_password(self, user: User, password: str) -> bool:
        return _UserService._pwd_context.verify(password, user.password)


UserService = _UserService()

__all__ = ["UserService"]
