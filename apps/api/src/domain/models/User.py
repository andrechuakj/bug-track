from pydantic import BaseModel, Field


class User(BaseModel):
    id: int | None = None
    name: str
    email: str
    password: str = Field(repr=False)
