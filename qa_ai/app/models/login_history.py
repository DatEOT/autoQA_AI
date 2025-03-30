from pydantic import BaseModel
from datetime import datetime


class LoginHistory(BaseModel):
    id_login_history: int
    idUser: int
    login_time: datetime

    class Config:
        from_attributes = True
