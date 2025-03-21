from typing import Sequence

from domain.config import get_db
from domain.views.dbms import BugCategoryResponseDto
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from services.bug_category_service import BugCategoryService

router = APIRouter(prefix="/api/v1/categories", tags=["bug_category"])


@router.get("/")
async def get_all_categories(r: Request) -> Sequence[BugCategoryResponseDto]:
    tx = get_db(r)
    return BugCategoryService.get_bug_categories(tx)
