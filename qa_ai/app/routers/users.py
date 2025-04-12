from fastapi import APIRouter, Depends, HTTPException, Form
import pymysql
from app.models.user import User, UserCreate
from app.utils.mysql_connection import get_db
from app.security.auth import hash_password, verify_password
from decimal import Decimal
from app.security.security import get_api_key
from datetime import datetime

router = APIRouter(prefix="/Usermanagement", tags=["Usermanagement"])


# GET all users
@router.get("/getUsers", response_model=list[User])
def get_users(
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT idUser, email, role, is_active, balance FROM users")
    results = cursor.fetchall()

    users = []
    for row in results:
        users.append(
            User(id=row[0], email=row[1], role=row[2], is_active=row[3], balance=row[4])
        )
    return users


# GET one user by ID
@router.get("/getUserID/{user_id}", response_model=User)
def get_user(
    user_id: int,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute(
        "SELECT idUser, email, role, is_active, balance FROM users WHERE idUser = %s",
        (user_id,),
    )
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(
        id=user[0], email=user[1], role=user[2], is_active=user[3], balance=user[4]
    )


# GET one user by Email
@router.get("/getUserByEmail/{email}", response_model=User)
def get_user_by_email(
    email: str,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute(
        "SELECT idUser, email, role, is_active, balance FROM users WHERE email = %s",
        (email,),
    )
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(
        id=user[0], email=user[1], role=user[2], is_active=user[3], balance=user[4]
    )


# POST create new user
@router.post("/createUser", response_model=dict)
def create_user(
    user: UserCreate,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    try:
        hashed_pw = hash_password(user.password)
        cursor.execute(
            "INSERT INTO users (email, password, role) VALUES (%s, %s, %s)",
            (user.email, hashed_pw, user.role if user.role else "user"),
        )
        db.commit()
        return {"message": "User created successfully"}
    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists")


# PUT update role
@router.put("/updateUser/{user_id}", response_model=dict)
def update_user_role(
    user_id: int,
    role: str,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE idUser = %s", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute("UPDATE users SET role = %s WHERE idUser = %s", (role, user_id))
    db.commit()
    return {"message": "User role updated successfully"}


@router.put("/updateBalance/{user_id}", response_model=dict)
def update_balance(
    user_id: int,
    amount: int,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT balance FROM users WHERE idUser = %s", (user_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    current_balance = Decimal(str(row[0]))
    new_balance = current_balance + Decimal(str(amount))

    if new_balance < 0:
        raise HTTPException(status_code=400, detail="Balance cannot be negative")

    cursor.execute(
        "UPDATE users SET balance = %s WHERE idUser = %s", (str(new_balance), user_id)
    )

    # Ghi log giao dịch KHÔNG CÓ description
    cursor.execute(
        """
        INSERT INTO transactions (idUser, change_amount, new_balance)
        VALUES (%s, %s, %s)
        """,
        (user_id, str(amount), str(new_balance)),
    )

    db.commit()
    return {
        "message": "Balance updated",
        "change_amount": str(amount),
        "new_balance": str(new_balance),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


@router.put("/setActive/{user_id}", response_model=dict)
def set_user_active(
    user_id: int,
    is_active: bool,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE idUser = %s", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute(
        "UPDATE users SET is_active = %s WHERE idUser = %s", (is_active, user_id)
    )
    db.commit()
    status = "unlocked" if is_active else "locked"
    return {"message": f"User {status} successfully"}


# DELETE user
@router.delete("/delete/{user_id}", response_model=dict)
def delete_user(
    user_id: int,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE idUser = %s", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute("DELETE FROM users WHERE idUser = %s", (user_id,))
    db.commit()
    return {"message": "User deleted successfully"}


@router.put("/changePassword", response_model=dict)
def change_password(
    user_id: int = Form(...),
    old_password: str = Form(...),
    new_password: str = Form(...),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()

    # Lấy mật khẩu cũ từ DB
    cursor.execute("SELECT password FROM users WHERE idUser = %s", (user_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    # Kiểm tra mật khẩu cũ có đúng không
    if not verify_password(old_password, row[0]):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")

    # Cập nhật mật khẩu mới (đã mã hóa)
    hashed_new_password = hash_password(new_password)
    cursor.execute(
        "UPDATE users SET password = %s WHERE idUser = %s",
        (hashed_new_password, user_id),
    )
    db.commit()

    return {"message": "Đổi mật khẩu thành công"}


@router.get("/countUsers", response_model=dict)
def count_users(
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(idUser) FROM users")
    count = cursor.fetchone()[0]
    return {"total_users": count}
