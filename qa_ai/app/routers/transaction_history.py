from fastapi import APIRouter, Depends, Query
import pymysql
from app.utils.mysql_connection import get_db
from app.security.security import get_api_key
from datetime import datetime, timedelta

router = APIRouter(prefix="/transactionHistory", tags=["transactionHistory"])


@router.get("/", response_model=list[dict])
def get_all_transaction_history(
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT idUser, change_amount, new_balance, timestamp
        FROM transactions ORDER BY timestamp DESC
        """
    )
    rows = cursor.fetchall()
    return [
        {
            "idUser": row[0],
            "change_amount": str(row[1]),
            "new_balance": str(row[2]),
            "timestamp": row[3].strftime("%Y-%m-%d %H:%M:%S"),
        }
        for row in rows
    ]


@router.get("/by-email", response_model=list[dict])
def get_transaction_history_by_email(
    email: str = Query(..., description="Email người dùng"),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()

    # Lấy idUser từ bảng users theo email
    cursor.execute("SELECT idUser FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        return {"error": "Không tìm thấy người dùng với email này."}
    idUser = user[0]

    # Lấy lịch sử giao dịch của user đó
    cursor.execute(
        """
        SELECT * FROM transactions
        WHERE idUser = %s
        ORDER BY timestamp DESC
        """,
        (idUser,),
    )
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    results = []
    for row in rows:
        record = {}
        for col, value in zip(columns, row):
            record[col] = (
                value.strftime("%Y-%m-%d %H:%M:%S")
                if hasattr(value, "strftime")
                else value
            )
        results.append(record)
    return results


@router.get("/by-date", response_model=dict)
def get_transactions_by_date_flexible(
    day: int = Query(None, ge=1, le=31),
    month: int = Query(None, ge=1, le=12),
    year: int = Query(None, ge=2000, le=2100),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    query_info = "Lịch sử giao dịch"
    conditions = []
    values = []

    # Xây dựng query động theo tổ hợp
    if day:
        conditions.append("DAY(timestamp) = %s")
        values.append(day)
        query_info += f" ngày {day:02d}"
    if month:
        conditions.append("MONTH(timestamp) = %s")
        values.append(month)
        query_info += f" tháng {month:02d}"
    if year:
        conditions.append("YEAR(timestamp) = %s")
        values.append(year)
        query_info += f" năm {year}"

    if conditions:
        sql = f"""
            SELECT idUser, change_amount, new_balance, timestamp
            FROM transactions
            WHERE {" AND ".join(conditions)}
            ORDER BY timestamp DESC
        """
        cursor.execute(sql, tuple(values))
    else:
        # Không truyền gì → lấy toàn bộ
        cursor.execute(
            """
            SELECT idUser, change_amount, new_balance, timestamp
            FROM transactions
            ORDER BY timestamp DESC
            """
        )

    rows = cursor.fetchall()
    return {
        "query_info": query_info,
        "results": [
            {
                "idUser": row[0],
                "change_amount": str(row[1]),
                "new_balance": str(row[2]),
                "timestamp": row[3].strftime("%Y-%m-%d %H:%M:%S"),
            }
            for row in rows
        ],
    }
