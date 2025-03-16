from sqlmodel import Field, SQLModel, Session, select

from domain.helpers.Timestampable import Timestampable
from internal.errors.client_errors import NotFoundError


class DBMSSystem(SQLModel, Timestampable, table=True):
    __tablename__ = "dbms_systems"
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None
    website_url: str | None = None
    logo_url: str | None = None
    github_url: str | None = None


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
