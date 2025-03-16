from domain.models.Dbms import Dbms

from random import sample

from pydantic import BaseModel
from typing import List
from enum import Enum
from collections import defaultdict
from domain.views.dbms import BugCategory
from domain.models.Dbms import BugReport


# Mock CategoryEnum (Simulating a table from the DB)
class CategoryEnum(Enum):
    CRASH = 0
    ASSERTION_FAILURE = 1
    USABILITY = 2
    COMPATIBILITY = 3
    INCORRECT_QUERY_RESULT = 4
    PERFORMANCE_DEGRADATION = 5
    CONSTRAINT_VIOLATION = 6
    DEADLOCK = 7
    DATA_CORRUPTION = 8
    SQL_SYNTAX_ERROR = 9
    PRIVILEGE_ESCALATION = 10
    MEMORY_LEAK = 11
    CONCURRENCY_ISSUE = 12
    TRANSACTION_ANOMALY = 13
    NON_ISSUES = 14

class _DbmsService:
    _mock_dbms: list[Dbms] = [
        Dbms(id=1, name="TiDB"),
    ]
    _next_id = 2

    # Mock Bug Reports
    # Mock Bug Reports for All Categories
    _mock_bug_reports = [
      BugReport(id=1, report_title=f"Title 1", dbms_id=1, category_id=CategoryEnum.CRASH.value, description='''## Bug Report

        Please answer these questions before submitting your issue. Thanks!

        ### 1. Minimal reproduce step (Required)

        ```sql
        SELECT UNCOMPRESSED_LENGTH('invalid_compressed_data')
        ```

        ### 2. What did you expect to see? (Required)

        MySQL returns `561409641`

        ### 3. What did you see instead (Required)

        TiDB returns `1635151465`.

        ### 4. What is your TiDB version? (Required)

        <!-- Paste the output of SELECT tidb_version() -->'''),
      BugReport(id=2, report_title=f"Title 2", dbms_id=1, category_id=CategoryEnum.CRASH.value, description=None),

      BugReport(id=3, report_title=f"Title 3", dbms_id=1, category_id=CategoryEnum.ASSERTION_FAILURE.value, description=None),
      BugReport(id=4, report_title=f"Title 4", dbms_id=1, category_id=CategoryEnum.ASSERTION_FAILURE.value, description='''
        In current code we don't fully make use of the prefetch buffer. There's a background goroutine (spawned in line 48) that uses the prefetch buffer to read data from reader (line 57)

        https://github.com/pingcap/tidb/blob/b7e97690b9feb019ab0bec9ea6814af432ae948d/pkg/util/prefetch/reader.go#L48-L63

        However if the reader only return partial data (like it's a socket and OS chooses to return only few bytes, naming `N`) this reading action is finished and the loop is waiting on sending to channel (line 62). If the caller of "prefetch reader" doesn't consume the channel quickly, we are wasting a large proportion of the prefetch buffer which is `buf[N:]` because they are not filled. We should let the background goroutine use `io.ReadFull` to fully use the prefetch buffer.'''),

      BugReport(id=5, report_title=f"Title 5", dbms_id=1, category_id=CategoryEnum.USABILITY.value, description=None),
      BugReport(id=6, report_title=f"Title 6", dbms_id=1, category_id=CategoryEnum.USABILITY.value, description=None),

      BugReport(id=7, report_title=f"Title 7", dbms_id=1, category_id=CategoryEnum.COMPATIBILITY.value, description=None),

      BugReport(id=8, report_title=f"Title 8", dbms_id=1, category_id=CategoryEnum.INCORRECT_QUERY_RESULT.value, description=None),
      BugReport(id=9, report_title=f"Title 9", dbms_id=1, category_id=CategoryEnum.INCORRECT_QUERY_RESULT.value, description=None),

      BugReport(id=10, report_title=f"Title 10", dbms_id=1, category_id=CategoryEnum.PERFORMANCE_DEGRADATION.value, description=None),
      BugReport(id=11, report_title=f"Title 11", dbms_id=1, category_id=CategoryEnum.PERFORMANCE_DEGRADATION.value, description=None),
      BugReport(id=12, report_title=f"Title 12", dbms_id=1, category_id=CategoryEnum.PERFORMANCE_DEGRADATION.value, description=None),

      BugReport(id=13, report_title=f"Title 13", dbms_id=1, category_id=CategoryEnum.CONSTRAINT_VIOLATION.value, description=None),
      BugReport(id=14, report_title=f"Title 14", dbms_id=1, category_id=CategoryEnum.CONSTRAINT_VIOLATION.value, description=None),

      BugReport(id=15, report_title=f"Title 15", dbms_id=1, category_id=CategoryEnum.DEADLOCK.value, description=None),

      BugReport(id=16, report_title=f"Title 16", dbms_id=1, category_id=CategoryEnum.DATA_CORRUPTION.value, description=None),
      BugReport(id=17, report_title=f"Title 17", dbms_id=1, category_id=CategoryEnum.DATA_CORRUPTION.value, description=None),

      BugReport(id=18, report_title=f"Title 18", dbms_id=1, category_id=CategoryEnum.SQL_SYNTAX_ERROR.value, description=None),
      BugReport(id=19, report_title=f"Title 19", dbms_id=1, category_id=CategoryEnum.SQL_SYNTAX_ERROR.value, description=None),

      BugReport(id=20, report_title=f"Title 20", dbms_id=1, category_id=CategoryEnum.PRIVILEGE_ESCALATION.value, description=None),

      BugReport(id=21, report_title=f"Title 21", dbms_id=1, category_id=CategoryEnum.MEMORY_LEAK.value, description=None),
      BugReport(id=22, report_title=f"Title 22", dbms_id=1, category_id=CategoryEnum.MEMORY_LEAK.value, description=None),

      BugReport(id=23, report_title=f"Title 23", dbms_id=1, category_id=CategoryEnum.CONCURRENCY_ISSUE.value, description=None),
      BugReport(id=24, report_title=f"Title 24", dbms_id=1, category_id=CategoryEnum.CONCURRENCY_ISSUE.value, description=None),

      BugReport(id=25, report_title=f"Title 25", dbms_id=1, category_id=CategoryEnum.TRANSACTION_ANOMALY.value, description=None),
      BugReport(id=26, report_title=f"Title 26", dbms_id=1, category_id=CategoryEnum.TRANSACTION_ANOMALY.value, description='''## Bug Report

        Please answer these questions before submitting your issue. Thanks!

        ### 1. Minimal reproduce step (Required)

        <!-- a step by step guide for reproducing the bug. -->

        ### 2. What did you expect to see? (Required)

        ```
        mysql> SELECT IS_UUID(' 6ccd780c-baba-1026-8567-4cc3505b2a62 ');
        +---------------------------------------------------+
        | IS_UUID(' 6ccd780c-baba-1026-8567-4cc3505b2a62 ') |
        +---------------------------------------------------+
        |                                                 0 |
        +---------------------------------------------------+
        1 row in set (0.03 sec)

        mysql> SELECT UUID_TO_BIN(' 6ccd780c-baba-1026-9564-5b8c656024db ');
        ERROR 1411 (HY000): Incorrect string value: ' 6ccd780c-baba-1026-9564-5b8c656024db ' for function uuid_to_bin
        ```

        ### 3. What did you see instead (Required)

        ```
        mysql> SELECT IS_UUID(' 6ccd780c-baba-1026-8567-4cc3505b2a62 ');
        +---------------------------------------------------+
        | IS_UUID(' 6ccd780c-baba-1026-8567-4cc3505b2a62 ') |
        +---------------------------------------------------+
        |                                                 1 |
        +---------------------------------------------------+
        1 row in set (0.00 sec)

        mysql> SELECT UUID_TO_BIN(' 6ccd780c-baba-1026-9564-5b8c656024db ');
        +--------------------------------------------------------------------------------------------------------------+
        | UUID_TO_BIN(' 6ccd780c-baba-1026-9564-5b8c656024db ')                                                        |
        +--------------------------------------------------------------------------------------------------------------+
        | 0x6CCD780CBABA102695645B8C656024DB                                                                           |
        +--------------------------------------------------------------------------------------------------------------+
        1 row in set (0.00 sec)
        ```

        ### 4. What is your TiDB version? (Required)

        <!-- Paste the output of SELECT tidb_version() -->'''),

      BugReport(id=27, report_title=f"Title 27", dbms_id=1, category_id=CategoryEnum.NON_ISSUES.value, description=None),
      BugReport(id=28, report_title=f"Title 28", dbms_id=1, category_id=CategoryEnum.NON_ISSUES.value, description=None),
    ]


    # Mock Categories
    _mock_categories = [
        {"id": CategoryEnum.CRASH.value, "category_name": "Crash / Segmentation Fault"},
        {"id": CategoryEnum.ASSERTION_FAILURE.value, "category_name": "Assertion Failure"},
        {"id": CategoryEnum.USABILITY.value, "category_name": "Usability"},
        {"id": CategoryEnum.COMPATIBILITY.value, "category_name": "Compatibility"},
        {"id": CategoryEnum.INCORRECT_QUERY_RESULT.value, "category_name": "Incorrect Query Result"},
        {"id": CategoryEnum.PERFORMANCE_DEGRADATION.value, "category_name": "Performance Degradation"},
        {"id": CategoryEnum.CONSTRAINT_VIOLATION.value, "category_name": "Constraint Violation"},
        {"id": CategoryEnum.DEADLOCK.value, "category_name": "Deadlock"},
        {"id": CategoryEnum.DATA_CORRUPTION.value, "category_name": "Data Corruption"},
        {"id": CategoryEnum.SQL_SYNTAX_ERROR.value, "category_name": "SQL Syntax / Parsing Error"},
        {"id": CategoryEnum.PRIVILEGE_ESCALATION.value, "category_name": "Privilege Escalation"},
        {"id": CategoryEnum.MEMORY_LEAK.value, "category_name": "Memory Leak / Resource Exhaustion"},
        {"id": CategoryEnum.CONCURRENCY_ISSUE.value, "category_name": "Concurrency Issue (race conditions, lost updates, etc.)"},
        {"id": CategoryEnum.TRANSACTION_ANOMALY.value, "category_name": "Transaction Anomaly (phantom reads, dirty reads, etc.)"},
        {"id": CategoryEnum.NON_ISSUES.value, "category_name": "Non-Issues"},
    ]

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
                count=bug_counts.get(category["id"], 0)
            )
            for category in self._mock_categories
        ]

        return bug_categories
    
    '''
        Sample a random set of bug descriptions.

        dbms_id: dbms from which we will sample the bug descriptions
        sample_percent: percentage of bug descriptions to sample
    '''
    # TODO: Replace each step with the appropriate ORM query
    def get_random_bug_descriptions_sample(self, dbms_id: int, sample_percent: float) -> List[str]:
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
        descriptions_sample = [self._mock_bug_reports[i].description for i in sample_idx]

        return descriptions_sample
    

    '''
        Params:
            - categories: List[str]: The categories to filter by, if empty, no filter applied
            - start should be 0-based
    '''
    def bug_search(self, dbms_id: int, search: str, start: int = 0, limit: int = 100, categories: List[int] = []) -> List[BugReport]:
        # TODO: replace with correct SQL / ORM stmt, need to access correct tenant db/table as well
        # TODO: Write it in a way that each category gets almost equal amount of bug reports
        res = [rep for rep in self._mock_bug_reports if search.lower() in rep.report_title.lower() and (rep.category_id in categories or len(categories) == 0)]

        return res[start:start+limit]
    
    '''
        A specific endpoint for querying ADDITIONAL bug reports, based on the current
        size distribution.
        start should be 0-based
    '''
    def bug_search_category(self, dbms_id: int, category: int, start: int, amount: int = 5) -> List[BugReport]:
        # TODO: replace with correct SQL / ORM stmt
        category_bugs = [rep for rep in self._mock_bug_reports if rep.category_id == category]
        sliced = category_bugs[start:start+amount]

        return sliced




DbmsService = _DbmsService()
