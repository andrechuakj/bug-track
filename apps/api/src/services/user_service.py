from typing import Sequence

from domain.models.User import *
from internal.errors import NotFoundError
from services.auth_service import get_password_hash


class _UserService:
    def get_users(self, tx: Session) -> Sequence[User]:
        return get_users(tx)

    def get_user(self, tx: Session, user_id: int):
        return get_user_by_id(tx, user_id)

    def get_user_by_email(self, tx: Session, email: str):
        return get_user_by_email(tx, email)

    def save_user(self, tx: Session, user: User):
        user.password = get_password_hash(user.password)
        return save_user(tx, user)

    def delete_user(self, tx: Session, user_id: int):
        user = self.get_user(tx, user_id)
        if user is None:
            raise NotFoundError("User not found")
        return delete_user(tx, user_id)


UserService = _UserService()

__all__ = ["UserService"]
