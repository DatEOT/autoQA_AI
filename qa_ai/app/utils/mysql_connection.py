import os, pymysql
from app.security.crypto import decrypt_secret
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


def get_db():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        user=os.getenv("DB_USERNAME"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_DATABASE"),
        charset="utf8mb4",
    )


@lru_cache(maxsize=128)
def get_plain_key(provider: str, mode_variant: str | None = None) -> str:
    conn = get_db()
    try:
        with conn.cursor() as cur:
            sql = "SELECT api_key FROM api_keys " "WHERE provider=%s " + (
                "AND model_variant=%s" if mode_variant else "LIMIT 1"
            )
            cur.execute(sql, (provider, mode_variant) if mode_variant else (provider,))
            row = cur.fetchone()
            if not row:
                raise RuntimeError("No API-key found")
            return decrypt_secret(row[0])
    finally:
        conn.close()
