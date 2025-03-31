import random

from domain.models.BugCategory import get_bug_category_by_ids
from domain.models.BugReport import (
    get_bug_categories_by_dbms_id,
    get_bug_report_by_ids,
    get_bug_report_ids_by_dbms_id,
    get_bug_report_by_search_and_cat,
    get_bug_ids_by_dbms_cat_id,
    get_bug_trend_last_k_days
)
from domain.models.DBMSSystem import *
from sqlmodel import Session
from utilities.classes import Service


class _DbmsService(Service):
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
        Parameters:
            - tx: the ORM session
            - dbms_id: the ID of the DBMS to query from
            - search: the search string for which our bug report titles should contain
            - start: 0-based starting index to offset our queries from
            - limit: maximum number of bug reports to fetch
            - categories: a list of categories from which our bug reports should come from'
                          if empty; query from all categories.
        """
        reports = get_bug_report_by_search_and_cat(
            tx, dbms_id, search, categories, start, limit
        )

        return reports

    def bug_search_category(
        self, tx: Session, dbms_id: int, category: int, start: int, amount: int = 5
    ):
        """
        Parameters:
            - tx: the ORM session
            - dbms_id: the ID of the DBMS to query from
            - category: 0-based index of the category as per DB
            - start: 0-based starting index to offset our queries from
            - amount: number of bug reports to fetch
        """
        reports = get_bug_report_by_search_and_cat(
            tx, dbms_id, "", [category], start, amount
        )

        return reports
    
    def get_bug_count_category(self, tx: Session, dbms_id: int, category_id: int):
        """
        Get the number of bug reports for a given DBMS.
        """
        reports = get_bug_ids_by_dbms_cat_id(tx, dbms_id, category_id)
        return len(reports)

    def get_bug_trend_last_k_days(
        self, tx: Session, dbms_id: int, days: int
    ) -> list[int]:
        """
        Get the number of bug reports for a given DBMS and category in the last k days.
        """
        trend = get_bug_trend_last_k_days(tx, dbms_id, days)

        return trend
    
DbmsService = _DbmsService()
