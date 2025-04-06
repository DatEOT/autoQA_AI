from pydantic import BaseModel
from decimal import Decimal


class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "user"


class User(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    balance: int

    class Config:
        from_attributes = True
