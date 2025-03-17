from sqlmodel import Session
from domain.models.BugReport import (
    get_bug_reports,
    get_bug_report_by_id,
)

class _BugReportService:

    def get_bug_reports(self, tx: Session):
        return get_bug_reports(tx)

    def get_bug_report_by_id(self, tx: Session, bug_report_id: int):
        return get_bug_report_by_id(tx, bug_report_id)

BugReportService = _BugReportService()
