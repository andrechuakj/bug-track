from sqlmodel import Field, SQLModel, Session, select

from domain.helpers.Timestampable import Timestampable
from internal.errors.client_errors import NotFoundError


class BugCategory(SQLModel, Timestampable, table=True):
    __tablename__ = "bug_categories"
    id: int | None = Field(default=None, primary_key=True)
    name: str


def get_bug_categories(tx: Session):
    return tx.exec(select(BugCategory)).all()


def get_bug_category(tx: Session, bug_category_id: int):
    return tx.get(BugCategory, bug_category_id)


def save_bug_category(tx: Session, bug_category: BugCategory):
    tx.add(bug_category)
    tx.commit()
    return bug_category


def delete_bug_category(tx: Session, bug_category_id: int):
    bug_category = get_bug_category(tx, bug_category_id)
    if not bug_category:
        raise NotFoundError(f"Bug category {bug_category_id} not found")
    tx.delete(bug_category)
    tx.commit()
    return bug_category
