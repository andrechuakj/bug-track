from sqlmodel import Session
from domain.models.BugCategory import get_bug_categories


class _BugCategoryService:

    def get_bug_categories(self, tx: Session):
        return get_bug_categories(tx)


BugCategoryService = _BugCategoryService()

__all__ = ["BugCategoryService"]
