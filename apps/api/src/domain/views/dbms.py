from utilities.views import BaseResponseModel


class DbmsListResponseDto(BaseResponseModel):
    id: int
    name: str


class BugCategoryResponseDto(BaseResponseModel):
    id: int
    name: str
    count: int


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
    category_id: int
    report_title: str
    description: str | None


class BugSearchResponseDto(BaseResponseModel):
    bug_reports: list[BugReportResponseDto]


class BugSearchCategoryResponseDto(BaseResponseModel):
    # Push this to the correct category on FE
    bug_reports_delta: list[BugReportResponseDto]
    # FE needs to update its bug_distr state (if any) with this
    new_bug_distr: list[int]
