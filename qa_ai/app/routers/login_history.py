from fastapi import APIRouter, Depends
import pymysql
from app.utils.mysql_connection import get_db
from app.models.login_history import LoginHistory

router = APIRouter(prefix="/login_history", tags=["login_history"])


# ✅ Lấy toàn bộ lịch sử đăng nhập (KHÔNG còn ip_address)
@router.get("/getAllHistory", response_model=list[LoginHistory])
def get_all_login_history(db: pymysql.connections.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        "SELECT id_login_history, idUser, login_time FROM login_history ORDER BY login_time DESC"
    )
    rows = cursor.fetchall()

    return [
        LoginHistory(id_login_history=row[0], idUser=row[1], login_time=row[2])
        for row in rows
    ]


# ✅ Lấy lần đăng nhập cuối
@router.get("/last_login/{idUser}", response_model=dict)
def get_last_login(idUser: int, db: pymysql.connections.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        "SELECT login_time FROM login_history WHERE idUser = %s ORDER BY login_time DESC LIMIT 1",
        (idUser,),
    )
    row = cursor.fetchone()
    if not row:
        return {"message": "Chưa có lịch sử đăng nhập"}
    return {"last_login": row[0]}
