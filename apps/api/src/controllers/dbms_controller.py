from collections import defaultdict
from typing import Sequence

import openai
from domain.config import get_db
from domain.views.dbms import (
    AiSummaryResponseDto,
    BugCategoryResponseDto,
    BugSearchCategoryResponseDto,
    BugSearchResponseDto,
    DbmsListResponseDto,
    DbmsResponseDto,
    BugReportResponseDto,
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
        bug_category_counts[(bug_category.id, bug_category.name)] += 1
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
        print("e:", e)
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

    Query parameters:
        Required:
            - search: the search string, which must match part of bug report titles
            - start: 0-based index representing the number of records to skip
            - limit: absolute value representing the max. num. of reports to return
        Optional
            - category_id: 0-based category_id which corresponds to that in db
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

    bug_reports = [
        BugReportResponseDto(
            id=r[0],
            dbms_id=r[1],
            category_id=r[2],
            title=r[3],
            description=r[4],
            url=r[5],
        )
        for r in reports
    ]

    return BugSearchResponseDto(bug_reports=bug_reports)


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

    Query parameters:
        Required:
            - category_id: 0-based category_id which corresponds to that in db
            - amount: number of additional reports to add
            - distribution: comma-separated values representing number of bugs present for
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

        delta = [
            BugReportResponseDto(
                id=r[0],
                dbms_id=r[1],
                category_id=r[2],
                title=r[3],
                description=r[4],
                url=r[5],
            )
            for r in delta
        ]

        delta_count = len(delta)
        distr[category_id] += delta_count
        return BugSearchCategoryResponseDto(
            bug_reports_delta=delta, new_bug_distr=distr
        )

    except Exception as e:
        raise BadRequestError(
            "Invalid request, amount or distribution not passed or passed incorrectly.",
        )


__all__ = ["router"]
