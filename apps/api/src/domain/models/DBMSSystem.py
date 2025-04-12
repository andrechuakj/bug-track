from domain.helpers.Timestampable import Timestampable
from internal.errors.client_errors import NotFoundError
from pydantic import computed_field
from sqlmodel import Field, Session, select


class DBMSSystem(Timestampable, table=True):
    __tablename__ = "dbms_systems"
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, min_length=1)
    description: str | None = Field(nullable=True, default=None)
    website_url: str | None = Field(nullable=True, default=None)
    logo_url: str | None = Field(nullable=True, default=None)
    repository: str = Field(nullable=False, min_length=1)
    label: str | None = Field(nullable=True, default=None)

    @computed_field(return_type=str)
    @property
    def github_url(self) -> str:
        return f"https://github.com/{self.repository}"


def get_dbms_systems(tx: Session):
    return tx.exec(select(DBMSSystem)).all()


def get_dbms_system_by_id(tx: Session, dbms_system_id: int):
    return tx.get(DBMSSystem, dbms_system_id)


def save_dbms_system(tx: Session, dbms_system: DBMSSystem):
    tx.add(dbms_system)
    tx.commit()
    return dbms_system


def delete_dbms_system(tx: Session, dbms_system_id: int):
    dbms_system = get_dbms_system_by_id(tx, dbms_system_id)
    if not dbms_system:
        raise NotFoundError(f"DBMS system {dbms_system_id} not found")
    tx.delete(dbms_system)
    tx.commit()
    return dbms_system
