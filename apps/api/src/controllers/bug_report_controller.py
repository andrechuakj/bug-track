from domain.config import get_db
from domain.views.dbms import (
    AiSummaryResponseDto,
    BugCategoryUpdateDto,
    BugReportResponseDto,
    BugPriorityUpdateDto,
)
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from services.bug_report_service import BugReportService

router = APIRouter(prefix="/api/v1/bug_reports", tags=["bug_reports"])


@router.get("/{bug_id}")
async def get_bug_report_by_id(bug_id: int, r: Request) -> BugReportResponseDto:
    tx = get_db(r)
    bug_report = BugReportService.get_bug_report_by_id(tx, bug_id)
    if bug_report is None:
        raise NotFoundError("Bug report {bug_id} not found")
    return bug_report


@router.patch("/{bug_id}/category")
async def update_bug_category(
    bug_id: int,
    dto: BugCategoryUpdateDto,
    r: Request,
) -> BugReportResponseDto:
    tx = get_db(r)
    bug_report = BugReportService.update_bug_category(tx, bug_id, dto.category_id)
    return bug_report


@router.patch("/{bug_id}/priority")
async def update_bug_priority(
    bug_id: int,
    dto: BugPriorityUpdateDto,
    r: Request,
) -> BugReportResponseDto:
    tx = get_db(r)
    bug_report = BugReportService.update_bug_priority(tx, bug_id, dto.priority_level)
    return bug_report


@router.get("/{bug_id}/ai_summary")
async def get_bug_report_ai_summary(bug_id: int, r: Request) -> AiSummaryResponseDto:
    tx = get_db(r)
    bug_report = BugReportService.get_bug_report_by_id(tx, bug_id)
    if bug_report is None:
        raise NotFoundError("Bug report {bug_id} not found")
    if bug_report.description is None:
        raise NotFoundError("Bug report {bug_id} has no description")
    summary = BugReportService.get_ai_summary(bug_report)
    return AiSummaryResponseDto(summary=summary)


__all__ = ["router"]
