from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str


class User(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True
