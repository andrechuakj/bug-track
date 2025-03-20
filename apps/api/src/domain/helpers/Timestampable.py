from datetime import datetime, timezone, timedelta
from sqlmodel import Field
from datetime import datetime
from typing import Annotated

SINGAPORE_TZ = timezone(timedelta(hours=8))
def now_sgt():
    return datetime.now(SINGAPORE_TZ)

class Timestampable:
    created_at: Annotated[datetime, Field(default_factory=now_sgt)]
    updated_at: Annotated[datetime, Field(default_factory=now_sgt)]

__all__ = ["Timestampable"]
