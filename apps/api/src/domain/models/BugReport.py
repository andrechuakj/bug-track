from domain.helpers.Timestampable import Timestampable
from domain.models.DBMSSystem import DBMSSystem
from domain.models.BugCategory import BugCategory
from internal.errors.client_errors import NotFoundError
from sqlmodel import Field, Session, select


class BugReport(Timestampable, table=True):
    __tablename__ = "bug_reports"
    id: int | None = Field(default=None, primary_key=True)
    dbms_id: int = Field(foreign_key="dbms_systems.id")
    category_id: int = Field(foreign_key="bug_categories.id")
    title: str
    description: str | None = None
    url: str | None = None


def get_bug_report_ids_by_dbms_id(tx: Session, dbms_id: int):
    return tx.exec(select(BugReport.id).where(BugReport.dbms_id == dbms_id)).all()


def get_bug_reports(tx: Session):
    return tx.exec(select(BugReport)).all()


def get_bug_report_by_id(tx: Session, bug_report_id: int):
    return tx.get(BugReport, bug_report_id)


def get_joined_bug_report_by_id(tx: Session, bug_report_id: int):
    statement = (
        select(
            BugReport.id,
            BugReport.dbms_id,
            DBMSSystem.name.label("dbms"),
            BugReport.category_id,
            BugCategory.name.label("category"),
            BugReport.title,
            BugReport.description
        )
        .join(DBMSSystem, BugReport.dbms_id == DBMSSystem.id)
        .join(BugCategory, BugReport.category_id == BugCategory.id)
        .where(BugReport.id == bug_report_id)
    )

    result = tx.exec(statement).first()
    if not result:
        raise NotFoundError(f"Bug report {bug_report_id} not found")

    return result

def get_bug_report_by_ids(tx: Session, bug_report_ids: list[int]):
    return tx.exec(select(BugReport).where(BugReport.id.in_(bug_report_ids))).all()


def get_bug_categories_by_dbms_id(tx: Session, dbms_id: int):
    return tx.exec(
        select(BugReport.category_id).distinct().where(BugReport.dbms_id == dbms_id)
    ).all()


def get_bug_report_by_search_and_cat(
    tx: Session,
    dbms_id: int,
    search: str,
    categories: list[int],
    start: int,
    limit: int,
):
    query = select(
        BugReport.id,
        BugReport.dbms_id,
        BugReport.category_id,
        BugReport.title,
        BugReport.description,
        BugReport.url,
    ).where(BugReport.dbms_id == dbms_id)

    if search:
        query = query.where(BugReport.title.ilike(f"%{search}%"))

    if categories:
        query = query.where(BugReport.category_id.in_(categories))
        query = query.offset(start).limit(limit)

        return tx.exec(query).all()

    else:  # equal distribution
        categories = get_bug_categories_by_dbms_id(tx=tx, dbms_id=dbms_id)

        per_category_limit = max(limit // len(categories), 1)

        results = []

        for category_id in categories:
            query = select(
                BugReport.id,
                BugReport.dbms_id,
                BugReport.category_id,
                BugReport.title,
                BugReport.description,
                BugReport.url,
            ).where(BugReport.dbms_id == dbms_id, BugReport.category_id == category_id)

            if search:
                query = query.where(BugReport.title.ilike(f"%{search}%"))

            query = query.offset(start).limit(per_category_limit)
            results += tx.exec(query).all()

        return results


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


def update_bug_category(tx: Session, bug_report_id: int, category_id: int):
    bug_report = get_bug_report_by_id(tx, bug_report_id)
    if not bug_report:
        raise NotFoundError(f"Bug report {bug_report_id} not found")
    bug_report.category_id = category_id
    tx.commit()
    return get_joined_bug_report_by_id(tx, bug_report_id)
