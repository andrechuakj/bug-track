from pydantic import BaseModel
from typing import List

from domain.models.Dbms import BugReport


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
    bug_categories: List[BugCategory]


class AiSummaryResponseDto(BaseModel):
    summary: str


class BugSearchResponseDto(BaseModel):
    bug_reports: List[BugReport]


class BugSearchCategoryResponseDto(BaseModel):
    # Push this to the correct category on FE
    bug_reports_delta: List[BugReport]
    # FE needs to update its bug_distr state (if any) with this
    new_bug_distr: List[int]
