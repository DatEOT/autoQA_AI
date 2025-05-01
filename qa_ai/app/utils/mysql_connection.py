import pymysql
import os
from dotenv import load_dotenv

load_dotenv()


def get_db():
    db = pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USERNAME"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_DATABASE"),
        charset="utf8mb4",
    )
    try:
        yield db
    finally:
        db.close()
