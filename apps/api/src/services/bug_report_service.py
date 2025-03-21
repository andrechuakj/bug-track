from sqlmodel import Session
from domain.models.BugReport import (
    get_bug_reports,
    get_bug_report_by_id,
    update_bug_category,
)


class _BugReportService:

    def get_bug_reports(self, tx: Session):
        return get_bug_reports(tx)

    def get_bug_report_by_id(self, tx: Session, bug_report_id: int):
        return get_bug_report_by_id(tx, bug_report_id)

    def update_bug_category(self, tx: Session, bug_report_id: int, category_id: int):
        return update_bug_category(tx, bug_report_id, category_id)


BugReportService = _BugReportService()

__all__ = ["BugReportService"]
