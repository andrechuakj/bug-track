from pydantic import BaseModel
from typing import List

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
