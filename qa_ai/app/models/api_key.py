from pydantic import BaseModel
from datetime import datetime


class ApiKeyBase(BaseModel):
    provider: str
    model_variant: str


class ApiKeyOut(ApiKeyBase):
    description: str | None = None
    updated_at: datetime

    class Config:
        from_attributes = True


class ApiKeyUpdate(BaseModel):
    api_key: str
    description: str | None = None
