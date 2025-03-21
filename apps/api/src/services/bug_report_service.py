from domain.models.BugReport import (
    get_bug_report_by_id,
    get_bug_reports,
    update_bug_category,
)
from sqlmodel import Session


class _BugReportService:

    def get_bug_reports(self, tx: Session):
        return get_bug_reports(tx)

    def get_bug_report_by_id(self, tx: Session, bug_report_id: int):
        bug_report = get_bug_report_by_id(tx, bug_report_id)
        result = {
            "id": bug_report.id,
            "dbms_id": bug_report.dbms.id,
            "dbms": bug_report.dbms.name if bug_report.dbms else None,
            "category_id": bug_report.category.id,
            "category": bug_report.category.name if bug_report.category else None,
            "title": bug_report.title,
            "description": bug_report.description,
        }
        return result

    def update_bug_category(self, tx: Session, bug_report_id: int, category_id: int):
        return update_bug_category(tx, bug_report_id, category_id)


BugReportService = _BugReportService()

__all__ = ["BugReportService"]
