from sqlmodel import Field, SQLModel

from domain.helpers.Timestampable import Timestampable


class BugCategory(SQLModel, Timestampable, table=True):
    __tablename__ = "bug_categories"
    id: int | None = Field(default=None, primary_key=True)
    name: str
