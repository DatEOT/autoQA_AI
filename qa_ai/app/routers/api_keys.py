from fastapi import APIRouter, Depends, HTTPException, Query
import pymysql
from datetime import datetime

from app.models.api_key import ApiKeyOut, ApiKeyUpdate
from app.utils.mysql_connection import get_db
from app.security.crypto import encrypt_secret, decrypt_secret
from app.security.security import get_api_key
from app.utils.mysql_connection import get_plain_key

router = APIRouter(prefix="/apikeys", tags=["API-Keys"])


# ---------- GET all ----------
@router.get("/", response_model=list[ApiKeyOut])
def list_api_keys(
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    # ✔ dùng DictCursor để rows là dict -> tránh lỗi column_names
    cur = db.cursor(pymysql.cursors.DictCursor)
    cur.execute(
        """
        SELECT provider, model_variant, description, updated_at
        FROM api_keys
        ORDER BY provider, model_variant
        """
    )
    return [ApiKeyOut(**row) for row in cur.fetchall()]


# ---------- GET one ----------
@router.get("/{provider}/Listvariants", response_model=list[str])
def list_variants(
    provider: str,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cur = db.cursor()
    cur.execute(
        "SELECT model_variant FROM api_keys WHERE provider=%s ORDER BY model_variant",
        (provider,),
    )
    return [row[0] for row in cur.fetchall()]


@router.get("/{provider}/{model_variant}", response_model=dict)
def get_api_keys(
    provider: str,
    model_variant: str,
    raw: bool = Query(False, description="Trả plaintext key?"),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cur = db.cursor()
    cur.execute(
        """
        SELECT api_key, description, updated_at
        FROM api_keys
        WHERE provider = %s AND model_variant = %s
        """,
        (provider, model_variant),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Key not found")

    cipher, description, updated_at = row
    payload = {
        "provider": provider,
        "model_variant": model_variant,
        "description": description,
        "updated_at": updated_at,
    }
    if raw:
        payload["api_key"] = decrypt_secret(cipher)
    return payload


@router.get("/{provider}/variants", response_model=list[str])
def list_variants(
    provider: str,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cur = db.cursor()
    cur.execute(
        "SELECT model_variant FROM api_keys WHERE provider=%s ORDER BY model_variant",
        (provider,),
    )
    return [row[0] for row in cur.fetchall()]


# ---------- PUT rotate (không cần key cũ) ----------
@router.put("/{provider}/{model_variant}", response_model=dict)
def rotate_api_key(
    provider: str,
    model_variant: str,
    body: ApiKeyUpdate,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cur = db.cursor()

    # 1) xác nhận hàng tồn tại
    cur.execute(
        "SELECT 1 FROM api_keys WHERE provider=%s AND model_variant=%s",
        (provider, model_variant),
    )
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Key not found")

    # 2) cập nhật key mới + mô tả
    cur.execute(
        """
        UPDATE api_keys
        SET api_key = %s,
            description = %s,
            updated_at = %s
        WHERE provider = %s AND model_variant = %s
        """,
        (
            encrypt_secret(body.api_key),
            body.description,
            datetime.utcnow(),
            provider,
            model_variant,
        ),
    )
    db.commit()
    get_plain_key.cache_clear()
    return {
        "message": "API-key rotated successfully",
        "updated_at": datetime.utcnow(),
    }
