from pydantic import BaseModel


class DbmsListResponseDto(BaseModel):
    id: int
    name: str


class BugCategory(BaseModel):
    id: int
    name: str
    count: int


class DbmsResponseDto(BaseModel):
    id: int
    name: str
    bug_count: int
    bug_categories: list[BugCategory]


class AiSummaryResponseDto(BaseModel):
    summary: str


class BugReportResponseDto(BaseModel):
    id: int
    dbms_id: int
    category_id: int
    report_title: str
    description: str | None


class BugSearchResponseDto(BaseModel):
    bug_reports: list[BugReportResponseDto]


class BugSearchCategoryResponseDto(BaseModel):
    # Push this to the correct category on FE
    bug_reports_delta: list[BugReportResponseDto]
    # FE needs to update its bug_distr state (if any) with this
    new_bug_distr: list[int]
