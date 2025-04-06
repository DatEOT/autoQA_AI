from fastapi import APIRouter, Depends
import pymysql
from app.utils.mysql_connection import get_db
from app.security.security import get_api_key

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
