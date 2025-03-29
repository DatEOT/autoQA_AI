import pymysql
from fastapi import Depends


def get_db():
    db = pymysql.connect(
        host="localhost", user="root", password="", database="qa_ai_db"
    )
    try:
        yield db
    finally:
        db.close()
