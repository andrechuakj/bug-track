from sqlmodel import Field, SQLModel

from domain.helpers.Timestampable import Timestampable


class DBMSSystem(SQLModel, Timestampable, table=True):
    __tablename__ = "dbms_systems"
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None
    website_url: str | None = None
    logo_url: str | None = None
    github_url: str | None = None
