import random

from domain.models.BugCategory import get_bug_category_by_ids
from domain.models.BugReport import (
    get_bug_categories_by_dbms_id,
    get_bug_ids_by_dbms_cat_id,
    get_bug_report_by_ids,
    get_bug_report_by_search_and_cat,
    get_bug_report_ids_by_dbms_id,
    get_bug_trend_last_k_days,
    get_new_bug_report_categories
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

        :param dbms_id:
            DBMS from which we will sample the bug descriptions.

        :param sample_percent:
            Proportion (number between 0-1) of bug descriptions to sample.
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
        search: str | None,
        start: int = 0,
        limit: int = 100,
        categories: list[int] = [],
    ):
        """
        :param tx:
            The ORM session.
        :param dbms_id:
            The ID of the DBMS to query from.
        :param search:
            The search string for which our bug report titles should contain.
        :param start:
            0-based starting index to offset our queries from.
        :param limit:
            Maximum number of bug reports to fetch.
        :param categories:
            A list of categories from which our bug reports should come from.
            If empty, query from all categories.
        """

        per_category_limit = None
        if not categories:
            self.logger.info(
                f"No categories provided; querying all categories for dbms_id: {dbms_id}"
            )
            categories = get_bug_categories_by_dbms_id(tx, dbms_id)
            self.logger.info(f"Found categories: {categories} for dbms_id: {dbms_id}")
            per_category_limit = max(limit // len(categories), 1)
            self.logger.info(
                f"Setting per_category_limit to {per_category_limit} for dbms_id: {dbms_id}"
            )
            limit = None
        reports = get_bug_report_by_search_and_cat(
            tx, dbms_id, search, categories, start, limit, per_category_limit
        )
        return reports

    def bug_search_category(
        self, tx: Session, dbms_id: int, category: int, start: int, amount: int = 5
    ):
        """
        :param tx:
            The ORM session.
        :param dbms_id:
            The ID of the DBMS to query from.
        :param category:
            0-based index of the category as per DB.
        :param start:
            0-based starting index to offset our queries from.
        :param amount:
            Number of bug reports to fetch.
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

    def get_num_reports_today(self, tx: Session, dbms_id: int) -> int:
        """
        Get the number of new bug reports for a given DBMS today.
        """
        trend = get_bug_trend_last_k_days(tx, dbms_id, 2)
        if len(trend) == 2:
            return trend[1] - trend[0]
        return 0

    def get_new_bug_report_categories_today(self, tx, dbms_id: int):
        """
        Fetches the categories of new bug reports for a given DBMS today.
        """
        categories = get_new_bug_report_categories(tx, dbms_id)
        return categories

DbmsService = _DbmsService()
