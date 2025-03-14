import os
import openai
from dotenv import load_dotenv, find_dotenv
from utilities.prompts import get_dbms_ai_summary_prompt

from typing import Sequence
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from services.dbms_service import DbmsService
from domain.views.dbms import DbmsResponseDto, DbmsListResponseDto, AiSummaryResponseDto


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
        
        print('dbmsdbms', dbms)
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



__all__ = ['router']
