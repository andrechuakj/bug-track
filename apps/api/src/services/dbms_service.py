from sqlmodel import Session
from domain.models.BugCategory import get_bug_category_by_ids
from domain.models.BugReport import (
    get_bug_report_by_dbms_and_category,
    get_bug_report_by_ids,
    get_bug_report_ids_by_dbms_id,
    get_bug_categories_by_dbms_id,
)
from domain.models.DBMSSystem import *
import random


class _DbmsService:

    def get_dbms(self, tx: Session):
        return get_dbms_systems(tx)

    def get_dbms_by_id(self, tx: Session, dbms_id: int):
        return get_dbms_system_by_id(tx, dbms_id)

    def get_dbms_bug_categories(self, tx: Session, dbms_id: int):
        category_ids = get_bug_categories_by_dbms_id(tx, dbms_id)
        print(f"Found categories: {category_ids} for dbms_id: {dbms_id}")
        bug_categories = get_bug_category_by_ids(tx, category_ids)
        return bug_categories

    def get_random_bug_descriptions_sample(
        self,
        tx: Session,
        dbms_id: int,
        sample_percent: float,
        random_seed: int | None = None,
    ) -> list[str]:
        """
        Sample a random set of bug descriptions.

        dbms_id: dbms from which we will sample the bug descriptions
        sample_percent: proportion (number between 0-1) of bug descriptions to sample
        """
        bug_reports = get_bug_report_ids_by_dbms_id(tx, dbms_id)
        print(f"Found bug reports: {bug_reports} for dbms_id: {dbms_id}")
        if random_seed is not None:
            random.seed(random_seed)
        sample_ids = random.sample(bug_reports, int(len(bug_reports) * sample_percent))
        reports = get_bug_report_by_ids(tx, sample_ids)
        return [r.description or "" for r in reports]

    def bug_search(
        self,
        tx: Session,
        dbms_id: int,
        search: str,
        start: int = 0,
        limit: int = 100,
        categories: list[int] = [],
    ):
        """
        Params:
            - categories: list[str]: The categories to filter by, if empty, no filter applied
            - start should be 0-based
        """
        # TODO: replace with correct SQL / ORM stmt, need to access correct tenant db/table as well
        # TODO: Write it in a way that each category gets almost equal amount of bug reports
        raise NotImplementedError("Not implemented yet")

    def bug_search_category(
        self, tx: Session, dbms_id: int, category: int, start: int, amount: int = 5
    ):
        """
        A specific endpoint for querying ADDITIONAL bug reports, based on the current
        size distribution.
        start should be 0-based
        """
        category_bugs = get_bug_report_by_dbms_and_category(tx, dbms_id, category)
        # TODO: Use limit and offset in SQL query directly
        return list(category_bugs)[start : start + amount]


DbmsService = _DbmsService()
