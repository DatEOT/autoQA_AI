from fastapi import APIRouter, Depends, HTTPException
import pymysql
from app.models.user import User, UserCreate
from app.utils.mysql_connection import get_db

router = APIRouter(prefix="/users", tags=["users"])


# GET all users
@router.get("/getUsers", response_model=list[User])
def get_users(db: pymysql.connections.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT idUser, email, role FROM users")
    results = cursor.fetchall()

    users = []
    for row in results:
        users.append(User(id=row[0], email=row[1], role=row[2]))
    return users


# GET one user by ID
@router.get("/getUserID/{user_id}", response_model=User)
def get_user(user_id: int, db: pymysql.connections.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute(
        "SELECT idUser, email, role FROM users WHERE idUser = %s", (user_id,)
    )
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(id=user[0], email=user[1], role=user[2])


# POST create new user
@router.post("/createUser", response_model=dict)
def create_user(user: UserCreate, db: pymysql.connections.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s)",
            (user.email, user.password),
        )
        db.commit()
        return {"message": "User created successfully"}
    except pymysql.err.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists")


# PUT update role
@router.put("/updateUser/{user_id}", response_model=dict)
def update_user_role(
    user_id: int, role: str, db: pymysql.connections.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE idUser = %s", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute("UPDATE users SET role = %s WHERE idUser = %s", (role, user_id))
    db.commit()
    return {"message": "User role updated successfully"}


# DELETE user
@router.delete("/delete/{user_id}", response_model=dict)
def delete_user(user_id: int, db: pymysql.connections.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE idUser = %s", (user_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    cursor.execute("DELETE FROM users WHERE idUser = %s", (user_id,))
    db.commit()
    return {"message": "User deleted successfully"}
