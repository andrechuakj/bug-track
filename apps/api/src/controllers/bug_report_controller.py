from typing import Sequence

from domain.config import get_db
from domain.views.dbms import BugCategoryUpdateDto, BugReportResponseDto
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
    bug_report = BugReportService.update_bug_category(
        tx,
        bug_id,
        dto.category_id,
    )
    return bug_report


__all__ = ["router"]
