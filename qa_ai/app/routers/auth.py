from fastapi import APIRouter, Depends, HTTPException
import pymysql
from app.models.user import UserCreate, User
from app.security.auth import hash_password, verify_password, create_access_token
from app.utils.mysql_connection import get_db

router = APIRouter(prefix="/authentication", tags=["authentication"])


@router.post("/register", response_model=dict)
async def register(
    user: UserCreate, db: pymysql.connections.Connection = Depends(get_db)
):
    cursor = db.cursor()
    hashed_password = hash_password(user.password)  # Băm mật khẩu
    try:
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s)",
            (user.email, hashed_password),
        )
        db.commit()
        return {"message": "Đăng ký thành công"}
    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")


@router.post("/login", response_model=dict)
async def login(user: UserCreate, db: pymysql.connections.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    db_user = cursor.fetchone()

    if not db_user:
        raise HTTPException(status_code=400, detail="Email không tồn tại")

    stored_password = db_user[2]  # Lấy mật khẩu đã băm từ MySQL
    if not verify_password(user.password, stored_password):  # So sánh
        raise HTTPException(status_code=400, detail="Mật khẩu sai")

    access_token = create_access_token(data={"sub": str(db_user[0])})
    return {
        "message": "Đăng nhập thành công",  # Thêm thông báo
        "access_token": access_token,
        "token_type": "bearer",
    }
