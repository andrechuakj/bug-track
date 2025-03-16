from typing import Sequence

from domain.models.User import *
from internal.errors import NotFoundError


class _UserService:
    def get_users(self, tx: Session) -> Sequence[User]:
        return get_users(tx)

    def get_user(self, tx: Session, user_id: int):
        return get_user_by_id(tx, user_id)

    def save_user(self, tx: Session, user: User):
        return save_user(tx, user)

    def delete_user(self, tx: Session, user_id: int):
        user = self.get_user(user_id)
        if user is None:
            raise NotFoundError("User not found")
        return delete_user(tx, user_id)


UserService = _UserService()

__all__ = ["UserService"]
