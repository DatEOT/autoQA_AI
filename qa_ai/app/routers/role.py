from fastapi import APIRouter, Depends, HTTPException, Query
import pymysql
from app.models.user import User, UserCreate
from app.utils.mysql_connection import get_db
from app.security.security import get_api_key

router = APIRouter(prefix="/roleUser", tags=["roleUsers"])


# routers/users.py
@router.get("/countRoles")
def count_roles(
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
    results = cursor.fetchall()
    return {role: count for role, count in results}


@router.get("/filterByRole", response_model=list[User])
def get_users_by_role(
    role: str = Query(..., regex="^(user|admin)$"),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute(
        "SELECT idUser AS id, email, role, is_active, balance FROM users WHERE role = %s",
        (role,),
    )
    users = cursor.fetchall()
    return users
