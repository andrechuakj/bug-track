from domain.models.Dbms import Dbms

from pydantic import BaseModel
from typing import List
from enum import Enum
from collections import defaultdict
from domain.views.dbms import BugCategory
from domain.models.Dbms import BugReport

# Mock CategoryEnum (Simulating a table from the DB)
class CategoryEnum(Enum):
    CRASH = 1
    ASSERTION_FAILURE = 2
    USABILITY = 3
    COMPATIBILITY = 4
    INCORRECT_QUERY_RESULT = 5
    PERFORMANCE_DEGRADATION = 6
    CONSTRAINT_VIOLATION = 7
    DEADLOCK = 8
    DATA_CORRUPTION = 9
    SQL_SYNTAX_ERROR = 10
    PRIVILEGE_ESCALATION = 11
    MEMORY_LEAK = 12
    CONCURRENCY_ISSUE = 13
    TRANSACTION_ANOMALY = 14
    NON_ISSUES = 15

class _DbmsService:
    _mock_dbms: list[Dbms] = [
        Dbms(id=1, name="TiDB"),
    ]
    _next_id = 2

    # Mock Bug Reports
    # Mock Bug Reports for All Categories
    _mock_bug_reports = [
      BugReport(id=1, dbms_id=1, category_id=CategoryEnum.CRASH.value),
      BugReport(id=2, dbms_id=1, category_id=CategoryEnum.CRASH.value),

      BugReport(id=3, dbms_id=1, category_id=CategoryEnum.ASSERTION_FAILURE.value),
      BugReport(id=4, dbms_id=1, category_id=CategoryEnum.ASSERTION_FAILURE.value),

      BugReport(id=5, dbms_id=1, category_id=CategoryEnum.USABILITY.value),
      BugReport(id=6, dbms_id=1, category_id=CategoryEnum.USABILITY.value),

      BugReport(id=7, dbms_id=1, category_id=CategoryEnum.COMPATIBILITY.value),

      BugReport(id=8, dbms_id=1, category_id=CategoryEnum.INCORRECT_QUERY_RESULT.value),
      BugReport(id=9, dbms_id=1, category_id=CategoryEnum.INCORRECT_QUERY_RESULT.value),

      BugReport(id=10, dbms_id=1, category_id=CategoryEnum.PERFORMANCE_DEGRADATION.value),
      BugReport(id=11, dbms_id=1, category_id=CategoryEnum.PERFORMANCE_DEGRADATION.value),
      BugReport(id=12, dbms_id=1, category_id=CategoryEnum.PERFORMANCE_DEGRADATION.value),

      BugReport(id=13, dbms_id=1, category_id=CategoryEnum.CONSTRAINT_VIOLATION.value),
      BugReport(id=14, dbms_id=1, category_id=CategoryEnum.CONSTRAINT_VIOLATION.value),

      BugReport(id=15, dbms_id=1, category_id=CategoryEnum.DEADLOCK.value),

      BugReport(id=16, dbms_id=1, category_id=CategoryEnum.DATA_CORRUPTION.value),
      BugReport(id=17, dbms_id=1, category_id=CategoryEnum.DATA_CORRUPTION.value),

      BugReport(id=18, dbms_id=1, category_id=CategoryEnum.SQL_SYNTAX_ERROR.value),
      BugReport(id=19, dbms_id=1, category_id=CategoryEnum.SQL_SYNTAX_ERROR.value),

      BugReport(id=20, dbms_id=1, category_id=CategoryEnum.PRIVILEGE_ESCALATION.value),

      BugReport(id=21, dbms_id=1, category_id=CategoryEnum.MEMORY_LEAK.value),
      BugReport(id=22, dbms_id=1, category_id=CategoryEnum.MEMORY_LEAK.value),

      BugReport(id=23, dbms_id=1, category_id=CategoryEnum.CONCURRENCY_ISSUE.value),
      BugReport(id=24, dbms_id=1, category_id=CategoryEnum.CONCURRENCY_ISSUE.value),

      BugReport(id=25, dbms_id=1, category_id=CategoryEnum.TRANSACTION_ANOMALY.value),
      BugReport(id=26, dbms_id=1, category_id=CategoryEnum.TRANSACTION_ANOMALY.value),

      BugReport(id=27, dbms_id=1, category_id=CategoryEnum.NON_ISSUES.value),
      BugReport(id=28, dbms_id=1, category_id=CategoryEnum.NON_ISSUES.value),
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


DbmsService = _DbmsService()
