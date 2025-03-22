import pytest
from domain.models.User import User
from internal.errors.client_errors import NotFoundError
from services.user_service import UserService
from utilities.testing import create_test_database


@pytest.fixture(name="tx")
def session():
    generate_session = create_test_database()
    return generate_session()


@pytest.fixture
def user():
    return User(id=1, name="John Tan", email="john@example.com", password="password")


def test_get_users(tx):
    users = UserService.get_users(tx)
    assert isinstance(users, list)


def test_save_new_user(tx, user):
    user.password = "new_password"
    saved_user = UserService.save_new_user(tx, user)
    # Ensure the password is hashed
    assert saved_user.password != "new_password"
    # Ensure timestamps are set
    assert saved_user.created_at is not None
    assert saved_user.updated_at is not None
    # On creation, timestamps should be equal
    assert saved_user.created_at == saved_user.updated_at


def test_get_user(tx, user):
    result = UserService.get_user(tx, user.id)
    assert result is None
    saved_user = UserService.save_new_user(tx, user)
    result = UserService.get_user(tx, saved_user.id)
    assert result is not None
    assert result == saved_user
    not_found = UserService.get_user(tx, saved_user.id + 1)
    assert not_found is None


def test_get_user_by_email(tx, user):
    result = UserService.get_user_by_email(tx, user.email)
    assert result is None
    saved_user = UserService.save_new_user(tx, user)
    result = UserService.get_user_by_email(tx, saved_user.email)
    assert result is not None
    assert result == user


def test_validate_user_password(tx, user):
    saved_user = UserService.save_new_user(tx, user)
    assert UserService.validate_user_password(saved_user, "password")
    assert not UserService.validate_user_password(saved_user, "wrong_password")
    assert not UserService.validate_user_password(saved_user, "PASSWORD")
    assert not UserService.validate_user_password(saved_user, "Password")


def test_delete_user(tx, user):
    # Test deleting a user that does not exist
    with pytest.raises(NotFoundError):
        UserService.delete_user(tx, user.id)

    # Test deleting an existing user
    saved_user = UserService.save_new_user(tx, user)
    deleted_user = UserService.delete_user(tx, saved_user.id)

    # Returns deleted user
    assert deleted_user is not None

    # Ensure the user is actually deleted
    result = UserService.get_user(tx, saved_user.id)
    assert result is None
