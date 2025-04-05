from datetime import datetime

from domain.views.user import UserSummaryResponseDto
from pydantic import BaseModel, computed_field
from utilities.views import BaseResponseModel


class CreateDiscussionRequestDto(BaseModel):
    bug_report_id: int
    content: str
    author_id: int


class CreateReplyRequestDto(BaseModel):
    content: str
    author_id: int


class DiscussionResponseDto(BaseResponseModel):
    id: int
    is_thread: bool
    author: UserSummaryResponseDto
    content: str
    replies: list["DiscussionReplyResponseDto"] = []
    created_at: datetime
    updated_at: datetime

    @computed_field(return_type=bool)
    @property
    def is_edited(self):
        return self.updated_at != self.created_at


class DiscussionReplyResponseDto(BaseResponseModel):
    id: int
    author: UserSummaryResponseDto
    content: str
    created_at: datetime
    updated_at: datetime

    @computed_field(return_type=bool)
    @property
    def is_edited(self):
        return self.updated_at != self.created_at
