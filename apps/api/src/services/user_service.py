from typing import Sequence

from domain.models.User import User
from internal.errors import NotFoundError


class _UserService:
    _mock_users: Sequence[User] = [
        User(id=1, name="John Doe", email="john.doe@example", password="password1"),
        User(id=2, name="Jane Doe", email="jane.doe@example", password="password2"),
    ]
    _next_id = 3

    def get_users(self):
        return self._mock_users

    def get_user(self, user_id: int):
        return next((user for user in self._mock_users if user.id == user_id), None)

    def save_user(self, user: User):
        user.id = self._next_id
        self._next_id += 1
        self._mock_users.append(user)
        return user

    def delete_user(self, user_id: int):
        user = self.get_user(user_id)
        if user is None:
            raise NotFoundError("User not found")
        self._mock_users = [u for u in self._mock_users if u.id != user_id]
        return user


UserService = _UserService()

__all__ = ["UserService"]
