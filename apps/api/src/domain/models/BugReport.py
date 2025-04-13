from datetime import datetime, timedelta, timezone

from domain.enums import PriorityLevel
from domain.helpers.Timestampable import Timestampable
from domain.models.BugCategory import BugCategory, get_bug_category_by_id
from domain.models.DBMSSystem import DBMSSystem
from internal.errors.client_errors import NotFoundError
from pydantic import ValidationInfo, field_validator
from sqlalchemy.sql import func
from sqlalchemy.sql.operators import is_
from sqlalchemy import Enum
from sqlmodel import TIMESTAMP, Field, Relationship, Session, select, text


class BugReport(Timestampable, table=True):
    __tablename__ = "bug_reports"
    id: int | None = Field(default=None, primary_key=True)
    dbms_id: int = Field(foreign_key="dbms_systems.id")
    dbms: DBMSSystem = Relationship()
    category_id: int | None = Field(
        foreign_key="bug_categories.id",
        nullable=True,
        default=None,
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
    priority: PriorityLevel = Field(
        sa_type=Enum(PriorityLevel, name="priority_level"),
        nullable=False,
        default=PriorityLevel.Unassigned,
    )
    versions_affected: str = Field(nullable=True, default=None)

    @field_validator("issue_closed_at", mode="before")
    @classmethod
    def validate_issue_closed_at(
        cls,
        value: datetime | None,
        info: ValidationInfo,
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
    search: str | None,
    categories: list[int],
    start: int,
    limit: int | None,
    per_category_limit: int | None = None,
):
    row_number = (
        func.row_number()
        .over(
            partition_by=BugReport.category_id,
            order_by=BugReport.created_at.desc(),
        )
        .label("row_number")
    )

    query = (
        select(BugReport, row_number)
        .where(BugReport.dbms_id == dbms_id)
        .where(search is None or BugReport.title.ilike(f"%{search}%"))
        .where(BugReport.category_id.in_(categories))
        .offset(start)
        .limit(limit)
    )

    if per_category_limit is None:
        res = tx.exec(query).all()
        return [r[0] for r in res]

    # Somehow, we can't just select * despite correct SQL generated
    query = (
        select(BugReport)
        .join(query.subquery().alias("sq"), BugReport.id == text("sq.id"))
        .where(text("row_number <= :per_category_limit"))
    )
    return tx.exec(query, params={"per_category_limit": per_category_limit}).all()


def get_latest_bug_report_time(tx: Session, dbms_id: int):
    return tx.scalar(
        select(BugReport.issue_created_at)
        .where(BugReport.dbms_id == dbms_id)
        .order_by(BugReport.issue_created_at.desc())
        .limit(1)
    )


def get_unclassified_bugs(tx: Session):
    return tx.exec(select(BugReport).where(is_(BugReport.category_id, None))).all()


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


def update_bug_priority(tx: Session, bug_report_id: int, priority: PriorityLevel):
    bug_report = tx.get(BugReport, bug_report_id)
    if not bug_report:
        raise NotFoundError(f"BugReport with id {bug_report_id} not found")

    bug_report.priority = priority
    tx.add(bug_report)
    tx.commit()
    return bug_report


def update_bug_versions_affected(
    tx: Session, bug_report_id: int, updated_versions: str
):
    bug_report = tx.get(BugReport, bug_report_id)
    if not bug_report:
        raise NotFoundError(f"BugReport with id {bug_report_id} not found")

    bug_report.versions_affected = updated_versions
    tx.add(bug_report)
    tx.commit()
    return bug_report


def get_new_bug_report_categories(tx: Session, dbms_id: int):
    today = datetime.now(timezone(timedelta(hours=8))).date()
    categories = (
        tx.exec(
            select(
                BugReport.category_id.label('id'),
                BugCategory.name.label("name"),
                func.count(BugReport.id).label("count"),
            )
            .where(
                BugReport.dbms_id == dbms_id,
                func.date(BugReport.created_at) == today,
            )
            .join(BugCategory, BugReport.category_id == BugCategory.id)
            .group_by(BugReport.category_id, BugCategory.name)
        )
        .all()
    )
    return categories
