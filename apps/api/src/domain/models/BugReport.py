from datetime import datetime, timedelta, timezone

from domain.helpers.Timestampable import Timestampable
from domain.models.BugCategory import BugCategory, get_bug_category_by_id
from domain.models.DBMSSystem import DBMSSystem
from internal.errors.client_errors import NotFoundError
from pydantic import ValidationInfo, field_validator
from sqlalchemy.sql import func
from sqlmodel import TIMESTAMP, Field, Relationship, Session, select


class BugReport(Timestampable, table=True):
    __tablename__ = "bug_reports"
    id: int | None = Field(default=None, primary_key=True)
    dbms_id: int = Field(foreign_key="dbms_systems.id")
    dbms: DBMSSystem = Relationship()
    category_id: int | None = Field(
        foreign_key="bug_categories.id", nullable=True, default=None
    )
    category: BugCategory | None = Relationship()
    title: str = Field(nullable=False, max_length=256)
    description: str | None = Field(nullable=True, default=None)
    url: str = Field(nullable=False, min_length=1)
    issue_created_at: datetime = Field(
        sa_type=TIMESTAMP(timezone=True),
        nullable=False,
    )
    issue_updated_at: datetime | None = Field(
        sa_type=TIMESTAMP(timezone=True),
        nullable=True,
        default=None,
    )
    issue_closed_at: datetime | None = Field(
        sa_type=TIMESTAMP(timezone=True),
        nullable=True,
        default=None,
    )
    is_closed: bool = Field(default=False)

    @field_validator("issue_closed_at", mode="before")
    @classmethod
    def validate_issue_closed_at(
        cls, value: datetime | None, info: ValidationInfo
    ) -> datetime | None:
        is_closed = info.data.get("is_closed", False)

        if is_closed and value is None:
            raise ValueError("'issue_closed_at' must be set when 'is_closed' is True")
        if not is_closed and value is not None:
            raise ValueError("'issue_closed_at' must be None when 'is_closed' is False")

        return value


def get_bug_report_ids_by_dbms_id(tx: Session, dbms_id: int):
    return tx.exec(select(BugReport.id).where(BugReport.dbms_id == dbms_id)).all()


def get_bug_ids_by_dbms_cat_id(tx: Session, dbms_id: int, category_id: int):
    return tx.exec(
        select(BugReport.id).where(
            BugReport.dbms_id == dbms_id, BugReport.category_id == category_id
        )
    ).all()


def get_bug_reports(tx: Session):
    return tx.exec(select(BugReport)).all()


def get_bug_report_by_id(tx: Session, bug_report_id: int):
    return tx.get(BugReport, bug_report_id)


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
    query = select(BugReport).where(BugReport.dbms_id == dbms_id)

    if search:
        query = query.where(BugReport.title.ilike(f"%{search}%"))

    if categories:
        query = query.where(BugReport.category_id.in_(categories))
        query = query.offset(start).limit(limit)

        res = tx.exec(query).all()

        return res

    else:  # equal distribution
        categories = get_bug_categories_by_dbms_id(tx=tx, dbms_id=dbms_id)

        per_category_limit = max(limit // len(categories), 1)

        results = []

        for category_id in categories:
            query = select(BugReport).where(
                BugReport.dbms_id == dbms_id, BugReport.category_id == category_id
            )

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
    bug_report = tx.get(BugReport, bug_report_id)
    if not bug_report:
        raise NotFoundError(f"BugReport with id {bug_report_id} not found")

    new_category = get_bug_category_by_id(tx, category_id)
    if not new_category:
        raise NotFoundError(f"BugCategory with id {category_id} not found")

    bug_report.category_id = category_id
    tx.add(bug_report)
    tx.commit()
    return bug_report


def get_bug_trend_last_k_days(tx: Session, dbms_id: int, k: int):
    today = today = datetime.utcnow().astimezone(timezone(timedelta(hours=8))).date()
    trend_data = []

    for i in range(k):
        day_start = today - timedelta(days=i)
        day_end = day_start + timedelta(days=1)

        count = tx.exec(
            select(func.count(BugReport.id)).where(
                BugReport.dbms_id == dbms_id,
                BugReport.created_at < day_end,
            )
        )

        trend_data.append(count.one())

    return trend_data[::-1]
