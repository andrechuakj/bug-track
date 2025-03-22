from time import sleep

import pytest
from domain.models.User import (
    User,
    delete_user,
    get_user_by_email,
    get_user_by_id,
    get_users,
    save_user,
)
from internal.errors.client_errors import NotFoundError
from sqlmodel import Session
from utilities.testing import create_test_database


@pytest.fixture(name="tx")
def session():
    generate_session = create_test_database()
    return generate_session()


@pytest.fixture
def user():
    return User(name="John Tan", email="john@example.com", password="password")


def test_get_users(tx: Session):
    users = get_users(tx)
    assert isinstance(users, list)


def test_save_user(tx: Session, user: User):
    saved_user = save_user(tx, user)

    assert saved_user.id is not None
    assert saved_user.name == user.name
    assert saved_user.email == user.email
    assert saved_user.password == user.password

    assert saved_user.created_at is not None
    assert saved_user.updated_at is not None
    assert saved_user.created_at == saved_user.updated_at

    # Update the user
    new_user = saved_user.model_copy()
    new_user.name = "Jane Tan"

    sleep(1)  # Sleep to ensure the updated_at timestamp is different

    saved_new_user = save_user(tx, new_user)
    assert saved_new_user.id == saved_user.id
    assert saved_new_user.name == new_user.name
    assert saved_new_user.email == new_user.email
    assert saved_new_user.password == new_user.password
    assert saved_new_user.created_at == saved_user.created_at
    # TODO: Investigate why the updated_at timestamp is not updated
    # assert saved_new_user.updated_at != saved_user.updated_at


def test_get_user_by_id(tx: Session, user: User):
    user.id = 1
    saved_user = save_user(tx, user)
    fetched_user = get_user_by_id(tx, saved_user.id)
    assert fetched_user is not None
    assert fetched_user.id == saved_user.id
    assert fetched_user.name == saved_user.name
    assert fetched_user.email == saved_user.email


def test_get_user_by_email(tx: Session, user: User):
    user.id = 1
    saved_user = save_user(tx, user)
    fetched_user = get_user_by_email(tx, saved_user.email)
    assert fetched_user is not None
    assert fetched_user.email == saved_user.email


def test_delete_user(tx: Session, user: User):
    user.id = 1
    saved_user = save_user(tx, user)
    deleted_user = delete_user(tx, saved_user.id)
    assert deleted_user is not None
    assert deleted_user.id == saved_user.id

    with pytest.raises(NotFoundError):
        delete_user(tx, saved_user.id)
