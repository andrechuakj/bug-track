from datetime import datetime
from domain.models.BugReport import (
    get_bug_report_by_id,
    get_bug_reports,
    update_bug_category,
)
from pydantic import BaseModel
from sqlmodel import Session


class _BugReportService:

    def get_bug_reports(self, tx: Session):
        return get_bug_reports(tx)

    class BugReportViewModel(BaseModel):
        id: int
        dbms_id: int
        dbms: str
        category_id: int
        category: str
        title: str
        description: str | None
        url: str | None = None
        repo_url: str | None = None
        issue_created_at: datetime
        issue_updated_at: datetime | None
        issue_closed_at: datetime | None
        is_closed: bool

    def get_bug_report_by_id(
        self,
        tx: Session,
        bug_report_id: int,
    ) -> BugReportViewModel:
        br = get_bug_report_by_id(tx, bug_report_id)
        return _BugReportService.BugReportViewModel(
            id=br.id,
            dbms_id=br.dbms.id,
            dbms=br.dbms.name,
            category_id=br.category.id,
            category=br.category.name,
            title=br.title,
            description=br.description,
            url=br.url,
            repo_url=br.repo_url,
            issue_created_at=br.issue_created_at,
            issue_updated_at=br.issue_updated_at,
            issue_closed_at=br.issue_closed_at,
            is_closed=br.is_closed,
        )

    def update_bug_category(self, tx: Session, bug_report_id: int, category_id: int):
        return update_bug_category(tx, bug_report_id, category_id)


BugReportService = _BugReportService()

__all__ = ["BugReportService"]
