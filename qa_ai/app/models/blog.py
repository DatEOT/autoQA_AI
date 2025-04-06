from pydantic import BaseModel
from typing import Optional


class BlogBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BlogBase):
    pass


class BlogOut(BlogBase):
    id: int
