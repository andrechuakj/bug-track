from datetime import datetime

from sqlmodel import TIMESTAMP, Field, SQLModel, func


class Timestampable(SQLModel):
    created_at: datetime | None = Field(
        sa_type=TIMESTAMP(timezone=True),
        nullable=False,
        default_factory=datetime.now,
        sa_column_kwargs={"server_default": func.now()},
    )
    updated_at: datetime | None = Field(
        sa_type=TIMESTAMP(timezone=True),
        nullable=False,
        default_factory=datetime.now,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
    )


__all__ = ["Timestampable"]
