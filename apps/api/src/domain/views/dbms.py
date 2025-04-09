from datetime import datetime

from domain.enums import PriorityLevel
from utilities.views import BaseResponseModel


class DbmsListResponseDto(BaseResponseModel):
    id: int
    name: str


class BugCategoryResponseDto(BaseResponseModel):
    id: int
    name: str
    count: int = 0


class BugCategoryUpdateDto(BaseResponseModel):
    category_id: int


class BugPriorityUpdateDto(BaseResponseModel):
    priority_level: PriorityLevel


class DbmsResponseDto(BaseResponseModel):
    id: int
    name: str
    bug_count: int
    bug_categories: list[BugCategoryResponseDto]


class AiSummaryResponseDto(BaseResponseModel):
    summary: str


class BugReportResponseDto(BaseResponseModel):
    id: int
    dbms_id: int
    dbms: str
    category_id: int | None
    category: str | None
    title: str
    description: str | None
    url: str
    issue_created_at: datetime
    issue_updated_at: datetime | None
    issue_closed_at: datetime | None
    is_closed: bool
    priority: PriorityLevel


class BugSearchResponseDto(BaseResponseModel):
    bug_reports: list[BugReportResponseDto]


class BugSearchCategoryResponseDto(BaseResponseModel):
    # Bug distribution used to establish the current loaded bugs
    # on Bug Explore on the FE
    new_bug_distr: list[int]
    # Load more feature
    bug_reports_delta: list[BugReportResponseDto]
