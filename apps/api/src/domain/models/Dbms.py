from pydantic import BaseModel, Field
from typing import Optional

class Dbms(BaseModel):
    id: int | None = None
    name: str

class CategoryEnum(BaseModel):
    id: int
    category_name: str

class BugReport(BaseModel):
    id: int
    dbms_id: int
    report_title: str
    category_id: int
    description: Optional[str]
