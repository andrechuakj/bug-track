import openai
from domain.config import get_db
from internal.errors.client_errors import BadRequestError
from utilities.prompts import get_dbms_ai_summary_prompt

from typing import Sequence
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from services.dbms_service import DbmsService
from domain.views.dbms import (
    DbmsResponseDto,
    DbmsListResponseDto,
    AiSummaryResponseDto,
    BugSearchResponseDto,
    BugSearchCategoryResponseDto,
)


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
    if dbms is None:
        raise NotFoundError(f"DBMS with id {dbms_id} not found")
    return DbmsResponseDto(
        id=dbms_id,
        name=dbms.name,
        # TODO: Update this once implemented
        bug_count=0,
        bug_categories=bug_categories,
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
async def get_bugs(dbms_id: int, r: Request) -> BugSearchResponseDto:
    """
    Note: category_id query param is optional
    """
    tx = get_db(r)
    search = r.query_params.get("search", "")
    try:
        start = int(r.query_params.get("start", 0))
        limit = int(r.query_params.get("limit", 10))
        category_id = r.query_params.get("category_id", None)
        if category_id is not None:
            category_id = int(category_id)
    except ValueError as e:
        raise BadRequestError("Invalid request, start and limit must be integers.")

    bug_reports = DbmsService.bug_search(
        tx,
        dbms_id,
        search,
        start,
        limit,
        [category_id] if category_id is not None else [],
    )

    return BugSearchResponseDto(bug_reports=bug_reports)


@router.get("/{dbms_id}/bug_search_category")
async def get_bugs_by_category(
    dbms_id: int, r: Request
) -> BugSearchCategoryResponseDto:
    """
    Get an extension of bug reports for a specific category, when viewing the bug list
    on the main dashboard by clicking 'Load more...'. This is when no search/filter/sort
    is applied.

    distribution values should be absolute counts
    """
    tx = get_db(r)
    try:
        category_id = int(r.query_params.get("category_id", None))
        amount = int(r.query_params.get("amount", 0))
    except ValueError as e:
        raise BadRequestError(
            "Invalid request, category_id and amount must be integers."
        )

    # passed as csv
    distribution = r.query_params.get("distribution")
    if distribution is None:
        raise BadRequestError(
            "Invalid request, please pass in distribution query param as comma-separated values."
        )
    try:
        distribution = [int(i) for i in distribution.split(",")]
        if amount == 0 or category_id >= len(distribution) or category_id < 0:
            raise BadRequestError(
                "Invalid request, amount or distribution not passed or passed incorrectly.",
            )

        # parse distribution

        bug_reports_delta = DbmsService.bug_search_category(
            dbms_id, category_id, distribution[category_id], amount
        )
        delta_count = len(bug_reports_delta)
        distribution[category_id] += delta_count
        return BugSearchCategoryResponseDto(
            bug_reports_delta=bug_reports_delta, new_bug_distr=distribution
        )

    except Exception as e:
        raise BadRequestError(
            "Invalid request, amount or distribution not passed or passed incorrectly.",
        )


__all__ = ["router"]
