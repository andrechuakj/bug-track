from datetime import datetime

from domain.enums import PriorityLevel
from domain.models.BugReport import (
    get_bug_report_by_id,
    get_bug_reports,
    update_bug_category,
    update_bug_priority,
)
import openai
from pydantic import BaseModel
from sqlmodel import Session
from utilities.classes import Service
from utilities.prompts import get_bug_report_ai_summary_prompt
from internal.errors import NotFoundError


class _BugReportService(Service):

    def get_bug_reports(self, tx: Session):
        self.logger.info("Fetching all bug reports")
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
        priority: PriorityLevel

    def get_bug_report_by_id(
        self,
        tx: Session,
        bug_report_id: int,
    ) -> BugReportViewModel | None:
        self.logger.info(f"Fetching bug report with id {bug_report_id}")
        br = get_bug_report_by_id(tx, bug_report_id)
        if br is None:
            self.logger.warning(f"Bug report with id {bug_report_id} not found")
            return None
        return _BugReportService.BugReportViewModel(
            **br.model_dump(),
            dbms=br.dbms.name,
            category=br.category.name,
        )

    def update_bug_category(self, tx: Session, bug_report_id: int, category_id: int):
        self.logger.info(
            f"Updating bug report with id {bug_report_id} to category {category_id}"
        )
        br = update_bug_category(tx, bug_report_id, category_id)
        return _BugReportService.BugReportViewModel(
            **br.model_dump(),
            dbms=br.dbms.name,
            category=br.category.name,
        )

    def update_bug_priority(
        self, tx: Session, bug_report_id: int, priority: PriorityLevel
    ):
        self.logger.info(
            f"Updating bug report with id {bug_report_id} to priority {priority}"
        )
        br = update_bug_priority(tx, bug_report_id, priority)
        return _BugReportService.BugReportViewModel(
            **br.model_dump(),
            dbms=br.dbms.name,
            category=br.category.name,
        )

    def get_ai_summary(self, bug_report: BugReportViewModel) -> str:
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": get_bug_report_ai_summary_prompt(
                            bug_report.dbms, bug_report.description
                        ),
                    },
                ],
                max_tokens=200,
                temperature=0.2,
            )
            summary = response.choices[0].message.content.strip()
            return summary
        except Exception as e:
            raise NotFoundError("AI Summary not found")


BugReportService = _BugReportService()

__all__ = ["BugReportService"]
