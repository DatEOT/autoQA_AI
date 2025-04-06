from fastapi import APIRouter, Depends, HTTPException, Request
import pymysql
from app.models.user import UserCreate, User
from app.security.auth import hash_password, verify_password, create_access_token
from app.utils.mysql_connection import get_db
from app.security.security import get_api_key
import re

router = APIRouter(
    prefix="/authentication",
    tags=["authentication"],
)


def validate_password(password: str) -> bool:
    """
    Kiểm tra mật khẩu:
    - Ít nhất 8 ký tự
    - Ít nhất 1 chữ cái (in hoa hoặc in thường)
    - Ít nhất 1 số
    - Ít nhất 1 ký tự đặc biệt
    """
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Mật khẩu phải có ít nhất 8 ký tự")

    # Regex:
    # - [A-Za-z]: Ít nhất 1 chữ cái
    # - [0-9]: Ít nhất 1 số
    # - [!@#$%^&*(),.?":{}|<>]: Ít nhất 1 ký tự đặc biệt
    if not re.search(r"[A-Za-z]", password):
        raise HTTPException(
            status_code=400, detail="Mật khẩu phải chứa ít nhất 1 chữ cái"
        )
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Mật khẩu phải chứa ít nhất 1 số")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise HTTPException(
            status_code=400,
            detail="Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: !, @, #, $)",
        )
    return True


@router.post("/register", response_model=dict)
async def register(
    user: UserCreate,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):

    validate_password(user.password)
    cursor = db.cursor()
    hashed_password = hash_password(user.password)
    try:
        cursor.execute(
            "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)",
            (user.email, hashed_password, user.role),
        )
        db.commit()
        return {"message": "Đăng ký thành công"}
    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail="Email đã tồn tại")


@router.post("/login", response_model=dict)
async def login(
    user: UserCreate,
    request: Request,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    db_user = cursor.fetchone()

    if not db_user:
        raise HTTPException(status_code=400, detail="Email không tồn tại")

    stored_password = db_user[2]
    role = db_user[3]
    is_active = db_user[4]
    balance = db_user[5]

    if not is_active:
        raise HTTPException(status_code=403, detail="Tài khoản đã bị khóa")

    if not verify_password(user.password, stored_password):
        raise HTTPException(status_code=400, detail="Mật khẩu sai")

    cursor.execute("INSERT INTO login_history (idUser) VALUES (%s)", (db_user[0],))
    db.commit()

    access_token = create_access_token(data={"sub": str(db_user[0])})
    return {
        "message": "Đăng nhập thành công",
        "access_token": access_token,
        "token_type": "bearer",
        "role": role,
        "balance": balance,
    }
