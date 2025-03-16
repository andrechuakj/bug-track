from sqlmodel import Field, SQLModel, Session, select

from domain.helpers.Timestampable import Timestampable
from internal.errors.client_errors import NotFoundError


class BugReport(SQLModel, Timestampable, table=True):
    __tablename__ = "bug_reports"
    id: int | None = Field(default=None, primary_key=True)
    dbms_id: int = Field(foreign_key="dbms_systems.id")
    category_id: int = Field(foreign_key="bug_categories.id")
    title: str
    description: str | None = None


def get_bug_reports(tx: Session):
    return tx.exec(select(BugReport)).all()


def get_bug_report_by_id(tx: Session, bug_report_id: int):
    return tx.get(BugReport, bug_report_id)


def save_bug_report(tx: Session, bug_report: BugReport):
    tx.add(bug_report)
    tx.commit()
    return bug_report


def delete_bug_report(tx: Session, bug_report_id: int):
    bug_report = get_bug_report_by_id(tx, bug_report_id)
    if not bug_report:
        raise NotFoundError(f"Bug report {bug_report_id} not found")
    tx.delete(bug_report)
    tx.commit()
    return bug_report
