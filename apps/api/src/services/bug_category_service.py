from domain.models.BugCategory import get_bug_categories
from sqlmodel import Session
from utilities.classes import Service


class _BugCategoryService(Service):

    def get_bug_categories(self, tx: Session):
        self.logger.info("Fetching all bug categories")
        return get_bug_categories(tx)


BugCategoryService = _BugCategoryService()

__all__ = ["BugCategoryService"]
