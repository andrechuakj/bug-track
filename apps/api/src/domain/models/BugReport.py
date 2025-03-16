from sqlmodel import Field, SQLModel

from domain.helpers.Timestampable import Timestampable


class BugReport(SQLModel, Timestampable, table=True):
    __tablename__ = "bug_reports"
    id: int | None = Field(default=None, primary_key=True)
    dbms_id: int = Field(foreign_key="dbms_systems.id")
    category_id: int = Field(foreign_key="bug_categories.id")
    title: str
    description: str | None = None
