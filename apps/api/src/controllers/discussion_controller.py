from domain.config import get_db
from domain.models.Comment import Comment
from domain.views.discussion import (
    CreateDiscussionRequestDto,
    CreateReplyRequestDto,
    DiscussionReplyResponseDto,
    DiscussionResponseDto,
)
from fastapi import APIRouter, Request
from services.discussion_service import DiscussionService

router = APIRouter(prefix="/api/v1/discussions", tags=["discussions"])


@router.get("/")
def get_discussions(bug_report_id: int, r: Request) -> list[DiscussionResponseDto]:
    tx = get_db(r)
    return DiscussionService.get_discussions(tx, bug_report_id)


@router.get("/{id}")
def get_discussion(id: int, r: Request) -> DiscussionResponseDto:
    tx = get_db(r)
    return DiscussionService.get_discussion_id(tx, id)


@router.post("/")
def add_bug_report_comment(
    dto: CreateDiscussionRequestDto, r: Request
) -> DiscussionResponseDto:
    tx = get_db(r)
    comment = Comment(**dto.model_dump())
    return DiscussionService.add_bug_report_comment(tx, comment)


@router.post("/{id}/reply")
def add_comment_reply(
    id: int, dto: CreateReplyRequestDto, r: Request
) -> DiscussionReplyResponseDto:
    tx = get_db(r)
    comment = Comment(**dto.model_dump())
    return DiscussionService.add_comment_to_thread(tx, comment, id)


__all__ = ["router"]
