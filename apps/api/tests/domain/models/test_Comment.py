import pytest
from domain.models import DBMSSystem
from domain.models.BugCategory import BugCategory
from domain.models.BugReport import BugReport
from domain.models.Comment import (
    Comment,
    get_comment_by_id,
    get_comments_by_bug_report_id,
    get_comments_by_thread_id,
    get_discussions_by_bug_report_id,
    save_comment,
)
from domain.models.User import User
from sqlmodel import Session
from utilities.testing import create_test_database


@pytest.fixture(name="tx")
def session():
    generate_session = create_test_database()
    return generate_session()


@pytest.fixture
def user(tx: Session):
    user = User(id=1, name="John Doe", email="john@example.com", password="password")
    tx.add(user)
    tx.commit()
    return user


@pytest.fixture
def bug_report(tx: Session):
    dbms_system = DBMSSystem(id=2, name="MySQL")
    tx.add(dbms_system)
    category = BugCategory(id=3, name="Feature Request")
    bug_report = BugReport(
        title="Test Bug Report",
        content="This is a bug report",
        author_id=1,
        bug_category_id=category.id,
        dbms_system_id=dbms_system.id,
    )
    tx.add(bug_report)
    tx.commit()
    return bug_report


@pytest.fixture
def comment(tx: Session, user: User):
    comment = Comment(content="This is a comment", author_id=user.id, bug_report_id=1)
    tx.add(comment)
    tx.commit()
    return comment


def test_get_comment_by_id(tx: Session, comment: Comment):
    result = get_comment_by_id(tx, comment.id)
    assert result is not None
    assert result.id == comment.id


def test_get_comments_by_bug_report_id(tx: Session, comment: Comment):
    results = get_comments_by_bug_report_id(tx, comment.bug_report_id)
    assert len(results) == 1
    assert comment in results


def test_get_discussions_by_bug_report_id(tx: Session, comment: Comment):
    results = get_discussions_by_bug_report_id(tx, comment.bug_report_id)
    assert len(results) == 1
    assert comment in results


def test_get_comments_by_thread_id(tx: Session, comment: Comment):
    results = get_comments_by_thread_id(tx, comment.thread_id)
    assert len(results) == 1
    assert comment in results


def test_save_comment(tx: Session, user: User):
    new_comment = Comment(content="New comment", author_id=user.id, bug_report_id=1)
    saved_comment = save_comment(tx, new_comment)
    assert saved_comment.id is not None
    assert saved_comment.content == "New comment"
    assert saved_comment.author_id == user.id
