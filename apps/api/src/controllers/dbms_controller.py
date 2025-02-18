from typing import Sequence
from fastapi import APIRouter, Request
from internal.errors import NotFoundError
from services.dbms_service import DbmsService
from domain.views.dbms import DbmsResponseDto, DbmsListResponseDto

router = APIRouter(prefix='/api/v1/dbms', tags=['dbms'])

@router.get('/')
async def get_all_dbms() -> Sequence[DbmsListResponseDto]:
    dbms_list = DbmsService.get_dbms()
    return [DbmsListResponseDto(id=dbms.id, name=dbms.name) for dbms in dbms_list]

@router.get('/{dbms_id}')
async def get_dbms_by_id(dbms_id: int, request: Request) -> DbmsResponseDto:
    dbms = DbmsService.get_dbms_by_id(dbms_id)
    bug_categories = DbmsService.get_dbms_bug_categories(dbms_id)
    if dbms is None:
        raise NotFoundError(f'DBMS of id {dbms_id} not found')
    return DbmsResponseDto(id=dbms_id,
                           name=dbms.name,
                           bug_count=sum(category.count for category in bug_categories),
                           bug_categories=bug_categories)


__all__ = ['router']
