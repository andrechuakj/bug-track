from collections import defaultdict
from typing import Sequence

import openai
from domain.config import get_db
from domain.views.dbms import (
    AiSummaryResponseDto,
    BugCategoryResponseDto,
    BugReportResponseDto,
    BugSearchCategoryResponseDto,
    BugSearchResponseDto,
    DbmsListResponseDto,
    DbmsResponseDto,
)
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from internal.errors.client_errors import BadRequestError
from services.dbms_service import DbmsService
from utilities.prompts import get_dbms_ai_summary_prompt

router = APIRouter(prefix="/api/v1/dbms", tags=["dbms"])


@router.get("/")
async def get_all_dbms(r: Request) -> Sequence[DbmsListResponseDto]:
    tx = get_db(r)
    return DbmsService.get_dbms(tx)


@router.get("/{dbms_id}")
async def get_dbms_by_id(dbms_id: int, r: Request) -> DbmsResponseDto:
    tx = get_db(r)
    dbms = DbmsService.get_dbms_by_id(tx, dbms_id)
    bug_categories = DbmsService.get_dbms_bug_categories(tx, dbms_id)
    bug_category_counts = defaultdict(int)
    for bug_category in bug_categories:
        bug_count = DbmsService.get_bug_count_category(tx, dbms_id, bug_category.id)
        bug_category_counts[(bug_category.id, bug_category.name)] = bug_count
    if dbms is None:
        raise NotFoundError(f"DBMS with id {dbms_id} not found")
    return DbmsResponseDto(
        id=dbms_id,
        name=dbms.name,
        bug_count=sum(bug_category_counts.values()),
        bug_categories=[
            BugCategoryResponseDto(id=id, name=name, count=count)
            for (id, name), count in bug_category_counts.items()
        ],
    )


@router.get("/{dbms_id}/ai_summary")
async def get_ai_summary(dbms_id: int, r: Request) -> AiSummaryResponseDto:
    tx = get_db(r)
    dbms = DbmsService.get_dbms_by_id(tx, dbms_id)
    if dbms is None:
        raise NotFoundError(f"DBMS with id {dbms_id} not found")
    sample_desc = DbmsService.get_random_bug_descriptions_sample(tx, dbms_id, 0.005)
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": get_dbms_ai_summary_prompt(dbms.name, sample_desc),
                },
            ],
            max_tokens=100,
            temperature=0.2,
        )
        summary = response["choices"][0]["message"]["content"].strip()
        return AiSummaryResponseDto(summary=summary)

    except Exception as e:
        print("eRROR:", e)
        return AiSummaryResponseDto(summary="Summary is not ready for this DBMS yet.")


@router.get("/{dbms_id}/bug_search")
async def get_bugs(
    dbms_id: int,
    r: Request,
    # Query parameters
    start: int = 0,
    limit: int = 10,
    search: str | None = None,
    category_id: int | None = None,
) -> BugSearchResponseDto:
    """
    Searches for bug reports from either all categories, while allocating
    as equal amounts of reports to each category as possible, or from a
    single category if category_id is specified.

    :param search:
        The search string, which must match part of bug report titles.
    :param start:
        0-based index representing the number of records to skip.
    :param limit:
        Absolute value representing the maximum number of reports to return.
    :param category_id:
        0-based category_id which corresponds to that in the database.
    """
    tx = get_db(r)
    reports = DbmsService.bug_search(
        tx,
        dbms_id,
        search,
        start,
        limit,
        [category_id] if category_id is not None else [],
    )

    return BugSearchResponseDto(
        bug_reports=[
            BugReportResponseDto(
                **report.model_dump(),
                category=report.category.name,
                dbms=report.dbms.name,
            )
            for report in reports
        ]
    )


@router.get("/{dbms_id}/bug_search_category")
async def get_bugs_by_category(
    dbms_id: int,
    r: Request,
    # Query parameters
    category_id: int,
    distribution: str,  # passed as csv
    amount: int,
) -> BugSearchCategoryResponseDto:
    """
    Searches for bug reports in a category from a certain offset as given from a
    distribution. On the FE, this corresponds to a load more feature for each bug
    category in the bug explore.

    :param category_id:
        0-based category_id which corresponds to that in db
    :param amount:
        Number of additional reports to add
    :param distribution:
        Comma-separated values representing number of bugs present for
        each category, starting from the 0th category, this convenintely
        corresponds to the offset from which we should fetch our bugs
    """
    tx = get_db(r)

    try:
        distr = [int(i) for i in distribution.strip().split(",")]

        if amount == 0 or category_id >= len(distr) or category_id < 0:
            raise BadRequestError(
                "Invalid request, amount or distribution not passed or passed incorrectly.",
            )

        delta = DbmsService.bug_search_category(
            tx, dbms_id, category_id, distr[category_id], amount
        )

        delta_count = len(delta)
        distr[category_id] += delta_count
        return BugSearchCategoryResponseDto(
            bug_reports_delta=[
                BugReportResponseDto(
                    **report.model_dump(),
                    category=report.category.name,
                    dbms=report.dbms.name,
                )
                for report in delta
            ],
            new_bug_distr=distr,
        )

    except Exception as e:
        raise BadRequestError(
            "Invalid request, amount or distribution not passed or passed incorrectly.",
        )


@router.get("/{dbms_id}/bug_trend")
async def get_bug_trend(
    dbms_id: int,
    r: Request,
    # Query parameters
    days: int = 30,
) -> list[int]:
    """
    Fetches the bug trend for the last `days` days for a given DBMS.

    Query parameters:
        - days: Number of days to fetch the bug trend for (default: 30)
    """
    tx = get_db(r)
    if days <= 0:
        raise BadRequestError("Days must be a positive integer.")

    trend_data = DbmsService.get_bug_trend_last_k_days(tx, dbms_id, days)
    return trend_data


__all__ = ["router"]
