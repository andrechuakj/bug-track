import os
import openai
from dotenv import load_dotenv, find_dotenv
from utilities.prompts import get_dbms_ai_summary_prompt

from typing import Sequence
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from services.dbms_service import DbmsService
from domain.views.dbms import DbmsResponseDto, DbmsListResponseDto, AiSummaryResponseDto, BugSearchResponseDto, BugSearchCategoryResponseDto
from fastapi import HTTPException


router = APIRouter(prefix='/api/v1/dbms', tags=['dbms'])

dotenv_path = find_dotenv('.env.local') or '.env.local'
load_dotenv(dotenv_path)

openai.api_key = os.getenv("OPENAI_API_KEY")

@router.get('/')
async def get_all_dbms() -> Sequence[DbmsListResponseDto]:
    dbms_list = DbmsService.get_dbms()
    return [DbmsListResponseDto(id=dbms.id, name=dbms.name) for dbms in dbms_list]

@router.get('/{dbms_id}')
async def get_dbms_by_id(dbms_id: int, request: Request = None) -> DbmsResponseDto:
    dbms = DbmsService.get_dbms_by_id(dbms_id)
    bug_categories = DbmsService.get_dbms_bug_categories(dbms_id)
    if dbms is None:
        raise NotFoundError(f'DBMS of id {dbms_id} not found')
    return DbmsResponseDto(id=dbms_id,
                           name=dbms.name,
                           bug_count=sum(category.count for category in bug_categories),
                           bug_categories=bug_categories)

@router.get('/{dbms_id}/ai_summary')
async def get_ai_summary(dbms_id: int) -> AiSummaryResponseDto:
    try: 
        dbms = DbmsService.get_dbms_by_id(dbms_id)
        
        sample_desc = DbmsService.get_random_bug_descriptions_sample(dbms_id, 0.005)

        response = openai.ChatCompletion.create(
          model="gpt-4o-mini",
          messages=[
              {"role": "user", "content": get_dbms_ai_summary_prompt(dbms.name, sample_desc)},
          ],
          max_tokens=100,
          temperature=0.2,
        )

        summary = response['choices'][0]['message']['content'].strip()

        return AiSummaryResponseDto(summary=summary)
    
    except Exception as e:
        print('e:', e)
        return AiSummaryResponseDto(summary="Summary is not ready for this DBMS yet.")

'''
    Note: category_id query param is optional
'''
@router.get('/{dbms_id}/bug_search')
async def get_bugs(dbms_id: int, request: Request) -> BugSearchResponseDto:
    try: 
        search = request.query_params.get("search", "")  
        start = int(request.query_params.get("start", 0))
        limit = int(request.query_params.get("limit", 10))
        category_id = request.query_params.get("category_id", None)

        bug_reports = DbmsService.bug_search(dbms_id, search, start, limit, [category_id] if category_id is not None else [])

        return BugSearchResponseDto(bug_reports=bug_reports)
    
    except Exception as e:
        print('e:', e)
        return BugSearchResponseDto(bug_reports=[])
    
'''
    Get an extension of bug reports for a specific category, when viewing the bug list 
    on the main dashboard by clicking 'Load more...'. This is when no search/filter/sort 
    is applied.

    distribution values should be absolute counts
'''
@router.get('/{dbms_id}/bug_search_category')
async def get_bugs_by_category(dbms_id: int, request: Request) -> BugSearchCategoryResponseDto:
    try: 
        category_id = int(request.query_params.get("category_id", None))
        amount = int(request.query_params.get("amount", 0))
        # passed as csv
        distribution = request.query_params.get("distribution")
        if distribution is None:
            raise HTTPException(status_code=400, detail="Invalid request, please pass in distribution query param as comma-separated values.")
        
        distribution = [int(i) for i in distribution.split(',')]

        if amount == 0 or category_id >= len(distribution) or category_id < 0:
            raise HTTPException(status_code=400, detail="Invalid request, amount or distribution not passed or passed incorrectly.")

        # parse distribution
        
        bug_reports_delta = DbmsService.bug_search_category(dbms_id, category_id, distribution[category_id], amount)
        delta_count = len(bug_reports_delta)
        distribution[category_id] += delta_count
        return BugSearchCategoryResponseDto(bug_reports_delta=bug_reports_delta, new_bug_distr=distribution)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid request, amount or distribution not passed or passed incorrectly.")

__all__ = ['router']
