from datetime import datetime

from sqlmodel import TIMESTAMP, Column

class Timestampable:
    created_at: datetime | None = Column(TIMESTAMP(timezone=True), default=None)
    updated_at: datetime | None = Column(TIMESTAMP(timezone=True), default=None)


__all__ = ["Timestampable"]
