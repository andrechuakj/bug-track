from domain.models.Dbms import Dbms


from typing import List
from collections import defaultdict
from domain.views.dbms import BugCategory
from domain.models.Dbms import BugReport


class _DbmsService:

    def get_dbms(self) -> List[Dbms]:
        return self._mock_dbms

    def get_dbms_by_id(self, dbms_id: int):
        return next((dbms for dbms in self._mock_dbms if dbms.id == dbms_id), None)

    def get_dbms_bug_categories(self, dbms_id: int) -> List[BugCategory]:
        # Count bugs per category for the given dbms_id
        bug_counts = defaultdict(int)
        for report in self._mock_bug_reports:
            if report.dbms_id == dbms_id:
                bug_counts[report.category_id] += 1

        # Create BugCategory list from all mock categories with counts or default 0
        bug_categories = [
            BugCategory(
                id=category["id"],
                name=category["category_name"],
                count=bug_counts.get(category["id"], 0),
            )
            for category in self._mock_categories
        ]

        return bug_categories

    """
        Sample a random set of bug descriptions.

        dbms_id: dbms from which we will sample the bug descriptions
        sample_percent: percentage of bug descriptions to sample
    """

    # TODO: Replace each step with the appropriate ORM query
    def get_random_bug_descriptions_sample(
        self, dbms_id: int, sample_percent: float
    ) -> List[str]:
        # TODO: Establish connection to the correct DBMS-tenant table
        # Get the bug count
        bug_count = len(self._mock_bug_reports)
        # Get the virtual id corresponding to each row in the database
        # Note that we do not support deletion yet, hence bug_report_id
        # (or its equivalent) will correspond to the physical row index

        # TODO: Replace the dummy code with the commented out code when
        #       we have populated the database
        # sample_idx = sample(range(bug_count), int(bug_count * sample_percent))
        sample_idx = [0, 3, 25]
        # Retrieve the corresponding rows with an IN query
        descriptions_sample = [
            self._mock_bug_reports[i].description for i in sample_idx
        ]

        return descriptions_sample

    """
        Params:
            - categories: List[str]: The categories to filter by, if empty, no filter applied
            - start should be 0-based
    """

    def bug_search(
        self,
        dbms_id: int,
        search: str,
        start: int = 0,
        limit: int = 100,
        categories: List[int] = [],
    ) -> List[BugReport]:
        # TODO: replace with correct SQL / ORM stmt, need to access correct tenant db/table as well
        # TODO: Write it in a way that each category gets almost equal amount of bug reports
        res = [
            rep
            for rep in self._mock_bug_reports
            if search.lower() in rep.report_title.lower()
            and (rep.category_id in categories or len(categories) == 0)
        ]

        return res[start : start + limit]

    """
        A specific endpoint for querying ADDITIONAL bug reports, based on the current
        size distribution.
        start should be 0-based
    """

    def bug_search_category(
        self, dbms_id: int, category: int, start: int, amount: int = 5
    ) -> List[BugReport]:
        # TODO: replace with correct SQL / ORM stmt
        category_bugs = [
            rep for rep in self._mock_bug_reports if rep.category_id == category
        ]
        sliced = category_bugs[start : start + amount]

        return sliced


DbmsService = _DbmsService()
