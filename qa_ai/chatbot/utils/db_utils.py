import pymysql
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)


def deduct_token_and_log_transaction(
    db: pymysql.connections.Connection, user_id: int, cost: int
) -> None:
    """
    Trừ token của người dùng và ghi log giao dịch.

    Args:
        db: Kết nối database
        user_id: ID người dùng
        cost: Số token cần trừ
    """
    try:
        cursor = db.cursor()
        cursor.execute("SELECT balance FROM users WHERE idUser = %s", (user_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

        current_balance = row[0] or 0
        if current_balance < cost:
            raise HTTPException(status_code=400, detail="Không đủ token để tạo đề")

        new_balance = current_balance - cost

        cursor.execute(
            "UPDATE users SET balance = %s WHERE idUser = %s",
            (new_balance, user_id),
        )

        cursor.execute(
            "INSERT INTO transactions (idUser, change_amount, new_balance) VALUES (%s, %s, %s)",
            (user_id, -cost, new_balance),
        )

        db.commit()

    except Exception as e:
        logger.error(f"Lỗi khi trừ token hoặc ghi giao dịch: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Lỗi khi xử lý giao dịch")


def insert_question_history(
    db: pymysql.connections.Connection, user_id: int, num_questions: int
) -> None:
    """
    Ghi lịch sử số lượng câu hỏi người dùng đã tạo.

    Args:
        db: Kết nối database
        user_id: ID người dùng
        num_questions: Số lượng câu hỏi đã tạo
    """
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO question_history (idUser, num_questions) VALUES (%s, %s)",
            (user_id, num_questions),
        )
        db.commit()

    except Exception as e:
        logger.error(f"Lỗi khi ghi lịch sử câu hỏi: {e}", exc_info=True)
