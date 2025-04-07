from fastapi import APIRouter, Depends
import pymysql
from typing import Optional
from datetime import date
from app.models.statistics import UserQuestionStats, GlobalStats, PeriodStats
from app.utils.mysql_connection import get_db
from app.security.security import get_api_key

router = APIRouter(prefix="/QuestionStats", tags=["QuestionStats"])


@router.get(
    "/getAllUserStats",
    response_model=list[UserQuestionStats],
    summary="Thống kê số lần tạo và tổng số câu hỏi của tất cả user (kèm email)",
)
def get_all_user_stats(
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT
          qh.idUser,
          u.email,
          COUNT(*) AS create_count,
          COALESCE(SUM(qh.num_questions), 0) AS total_questions
        FROM question_history qh
        JOIN users u ON qh.idUser = u.idUser
        GROUP BY qh.idUser, u.email
        """
    )
    rows = cursor.fetchall()
    return [
        UserQuestionStats(
            idUser=row[0],
            email=row[1],
            create_count=row[2],
            total_questions=row[3],
        )
        for row in rows
    ]


@router.get(
    "/getUserStatsInRange",
    response_model=list[UserQuestionStats],
    summary="Thống kê top user trong khoảng thời gian",
)
def get_user_stats_in_range(
    start: str,
    end: str,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT
            qh.idUser,
            u.email,
            COUNT(*) AS create_count,
            COALESCE(SUM(qh.num_questions), 0) AS total_questions
        FROM question_history qh
        JOIN users u ON qh.idUser = u.idUser
        WHERE DATE(qh.created_at) BETWEEN %s AND %s
        GROUP BY qh.idUser, u.email
        """,
        (start, end),
    )
    rows = cursor.fetchall()
    return [
        UserQuestionStats(
            idUser=row[0],
            email=row[1],
            create_count=row[2],
            total_questions=row[3],
        )
        for row in rows
    ]


@router.get("/getStatsInRange", response_model=GlobalStats)
def get_stats_in_range(
    start: str,
    end: str,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()

    # Số lần tạo
    cursor.execute(
        """
        SELECT COUNT(*), COALESCE(SUM(num_questions), 0)
        FROM question_history
        WHERE DATE(created_at) BETWEEN %s AND %s
        """,
        (start, end),
    )
    creation_count, question_sum = cursor.fetchone()

    stats = PeriodStats(
        day=0,
        month=0,
        year=0,
        total=creation_count,  # dùng total làm chỗ chứa thống kê trong khoảng
    )
    questions = PeriodStats(
        day=0,
        month=0,
        year=0,
        total=question_sum,
    )
    return GlobalStats(creation_stats=stats, question_stats=questions)


@router.get(
    "/getBalanceBreakdown", summary="Tổng nạp và trừ token trong khoảng thời gian"
)
def get_balance_breakdown(
    start: Optional[str] = None,
    end: Optional[str] = None,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()

    if start and end:
        cursor.execute(
            """
            SELECT
              COALESCE(SUM(CASE WHEN change_amount > 0 THEN change_amount ELSE 0 END), 0) AS total_added,
              COALESCE(SUM(CASE WHEN change_amount < 0 THEN change_amount ELSE 0 END), 0) AS total_subtracted
            FROM transactions
            WHERE DATE(timestamp) BETWEEN %s AND %s
            """,
            (start, end),
        )
    else:
        cursor.execute(
            """
            SELECT
              COALESCE(SUM(CASE WHEN change_amount > 0 THEN change_amount ELSE 0 END), 0) AS total_added,
              COALESCE(SUM(CASE WHEN change_amount < 0 THEN change_amount ELSE 0 END), 0) AS total_subtracted
            FROM transactions
            """
        )

    result = cursor.fetchone()

    if result is None:
        added = 0
        subtracted = 0
    else:
        added = float(result[0] or 0)
        subtracted = float(result[1] or 0)

    added = int(added) if added.is_integer() else added
    subtracted = int(subtracted) if subtracted.is_integer() else subtracted

    return {
        "total_added": added,
        "total_subtracted": subtracted,
        "net_change": added + subtracted,
    }


@router.get(
    "/getGlobalStats",
    response_model=GlobalStats,
    summary="Thống kê số lần tạo & số câu hỏi theo ngày/tháng/năm/tổng (tất cả user)",
)
def get_global_stats(
    year: int = None,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    today = date.today()
    year = year or today.year
    month = today.month

    cursor = db.cursor()

    # Tổng (all time)
    cursor.execute(
        "SELECT COUNT(*), COALESCE(SUM(num_questions),0) FROM question_history"
    )
    total_creations, total_questions = cursor.fetchone()

    # Trong năm (theo query)
    cursor.execute(
        "SELECT COUNT(*), COALESCE(SUM(num_questions),0) "
        "FROM question_history WHERE YEAR(created_at) = %s",
        (year,),
    )
    year_creations, year_questions = cursor.fetchone()

    # Trong tháng (chỉ tính nếu là năm hiện tại)
    if year == today.year:
        cursor.execute(
            "SELECT COUNT(*), COALESCE(SUM(num_questions),0) "
            "FROM question_history WHERE YEAR(created_at) = %s AND MONTH(created_at) = %s",
            (year, month),
        )
        month_creations, month_questions = cursor.fetchone()

        cursor.execute(
            "SELECT COUNT(*), COALESCE(SUM(num_questions),0) "
            "FROM question_history WHERE DATE(created_at) = %s",
            (today,),
        )
        day_creations, day_questions = cursor.fetchone()
    else:
        month_creations = month_questions = 0
        day_creations = day_questions = 0

    creation_stats = PeriodStats(
        day=day_creations,
        month=month_creations,
        year=year_creations,
        total=total_creations,
    )
    question_stats = PeriodStats(
        day=day_questions,
        month=month_questions,
        year=year_questions,
        total=total_questions,
    )

    return GlobalStats(creation_stats=creation_stats, question_stats=question_stats)
