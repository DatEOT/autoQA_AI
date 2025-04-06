from fastapi import APIRouter, Depends
import pymysql
from app.utils.mysql_connection import get_db
from app.models.login_history import LoginHistory
from app.security.security import get_api_key

router = APIRouter(prefix="/login_history", tags=["login_history"])


@router.get("/last_login/{idUser}", response_model=dict)
def get_last_login(
    idUser: int,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute(
        "SELECT login_time FROM login_history WHERE idUser = %s ORDER BY login_time DESC LIMIT 1",
        (idUser,),
    )
    row = cursor.fetchone()
    if not row:
        return {"message": "Chưa có lịch sử đăng nhập"}
    return {"last_login": row[0]}
