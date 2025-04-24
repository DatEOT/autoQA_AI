from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
import base64
import pymysql
from app.models.config import Config, WebsiteUpdate, ContactUpdate, SocialMediaUpdate
from typing import List
from app.utils.mysql_connection import get_db
from app.security.security import get_api_key

router = APIRouter(prefix="/config", tags=["config"])


@router.get("/getAll/", response_model=List[Config])
def get_all_config(
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT * FROM config")
    result = cursor.fetchall()

    for row in result:
        if row.get("logo"):
            row["logo"] = base64.b64encode(row["logo"]).decode("utf-8")

    return result


# Thêm endpoint GET cho website
@router.get("/website/{idConfig}", response_model=dict)
def get_website(
    idConfig: int,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute(
        "SELECT websiteName, websiteDescription, websiteKeywords, logo FROM config WHERE idConfig = %s",
        (idConfig,),
    )
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Config not found")

    if result.get("logo"):
        base64_logo = base64.b64encode(result["logo"]).decode("utf-8")
        result["logo"] = f"data:image/jpeg;base64,{base64_logo}"

    return result


# Thêm endpoint GET cho contact
@router.get("/contact/{idConfig}", response_model=dict)
def get_contact(
    idConfig: int,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute(
        "SELECT phoneNumber1, phoneNumber2, address FROM config WHERE idConfig = %s",
        (idConfig,),
    )
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Config not found")
    return result


# Thêm endpoint GET cho social-media
@router.get("/social-media/{idConfig}", response_model=dict)
def get_social_media(
    idConfig: int,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute(
        "SELECT tiktok, facebook, zalo FROM config WHERE idConfig = %s", (idConfig,)
    )
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Config not found")
    return result


# Các endpoint PUT giữ nguyên
@router.put("/website/{idConfig}", response_model=dict)
async def update_website(
    idConfig: int,
    websiteName: str = Form(None),
    websiteDescription: str = Form(None),
    websiteKeywords: str = Form(None),
    logo: UploadFile = File(None),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()

    # Kiểm tra tồn tại
    cursor.execute("SELECT idConfig FROM config WHERE idConfig = %s", (idConfig,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Config not found")

    set_clauses = []
    values = []

    if websiteName is not None:
        set_clauses.append("websiteName = %s")
        values.append(websiteName)
    if websiteDescription is not None:
        set_clauses.append("websiteDescription = %s")
        values.append(websiteDescription)
    if websiteKeywords is not None:
        set_clauses.append("websiteKeywords = %s")
        values.append(websiteKeywords)
    if logo is not None:
        content = await logo.read()
        set_clauses.append("logo = %s")
        values.append(content)

    if not set_clauses:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    values.append(idConfig)
    query = f"UPDATE config SET {', '.join(set_clauses)} WHERE idConfig = %s"

    try:
        cursor.execute(query, values)
        db.commit()
        return {"message": "Website configuration updated successfully"}
    except pymysql.err.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/contact/{idConfig}", response_model=dict)
def update_contact(
    idConfig: int,
    update_data: ContactUpdate,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT idConfig FROM config WHERE idConfig = %s", (idConfig,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Config not found")

    set_clauses = []
    values = []
    if update_data.phoneNumber1 is not None:
        set_clauses.append("phoneNumber1 = %s")
        values.append(update_data.phoneNumber1)
    if update_data.phoneNumber2 is not None:
        set_clauses.append("phoneNumber2 = %s")
        values.append(update_data.phoneNumber2)
    if update_data.address is not None:
        set_clauses.append("address = %s")
        values.append(update_data.address)

    if not set_clauses:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    values.append(idConfig)
    query = f"UPDATE config SET {', '.join(set_clauses)} WHERE idConfig = %s"

    try:
        cursor.execute(query, values)
        db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Config not found")
        return {"message": "Contact configuration updated successfully"}
    except pymysql.err.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/social-media/{idConfig}", response_model=dict)
def update_social_media(
    idConfig: int,
    update_data: SocialMediaUpdate,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT idConfig FROM config WHERE idConfig = %s", (idConfig,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Config not found")

    set_clauses = []
    values = []
    if update_data.tiktok is not None:
        set_clauses.append("tiktok = %s")
        values.append(update_data.tiktok)
    if update_data.facebook is not None:
        set_clauses.append("facebook = %s")
        values.append(update_data.facebook)
    if update_data.zalo is not None:
        set_clauses.append("zalo = %s")
        values.append(update_data.zalo)

    if not set_clauses:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    values.append(idConfig)
    query = f"UPDATE config SET {', '.join(set_clauses)} WHERE idConfig = %s"

    try:
        cursor.execute(query, values)
        db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Config not found")
        return {"message": "Social media configuration updated successfully"}
    except pymysql.err.Error as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
