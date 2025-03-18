from typing import Sequence

from domain.models.User import *
from internal.errors import NotFoundError


class _UserService:
    _mock_users: list[User] = [
        User(id=1, name="John Doe", email="john.doe@example", password="password1"),
        User(id=2, name="Jane Doe", email="jane.doe@example", password="password2"),
    ]
    _next_id = 3

    def get_users(self) -> Sequence[User]:
        return self._mock_users

    def get_user(self, user_id: int):
        return next((user for user in self._mock_users if user.id == user_id), None)

    def get_user_by_email(self, tx: Session, email: str):
        return get_user_by_email(tx, email)

    def save_user(self, user: User):
        user.id = self._next_id
        self._next_id += 1
        self._mock_users.append(user)
        return user

    def delete_user(self, user_id: int):
        user = self.get_user(tx, user_id)
        if user is None:
            raise NotFoundError("User not found")
        return delete_user(tx, user_id)


UserService = _UserService()

__all__ = ["UserService"]
