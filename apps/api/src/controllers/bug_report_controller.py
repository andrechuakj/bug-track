from typing import Sequence

from domain.config import get_db
from domain.models.BugReport import BugReport
from domain.views.dbms import BugReportResponseDto
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from services.bug_report_service import BugReportService

router = APIRouter(prefix="/api/v1/bug", tags=["bug_reports"])


@router.get("/")
async def get_all_bugs(r: Request) -> Sequence[BugReportResponseDto]:
    tx = get_db(r)
    return BugReportService.get_bug_reports(tx)


@router.get("/{bug_id}")
async def get_single_bug(bug_id: int, r: Request) -> BugReportResponseDto:
    tx = get_db(r)
    bug_report = BugReportService.get_bug_report_by_id(tx, bug_id)
    if bug_report is None:
        raise NotFoundError("Bug report not found")
    return bug_report

__all__ = ["router"]
