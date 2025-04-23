from fastapi import APIRouter, Depends, HTTPException
import pymysql
from app.models.config import WebsiteUpdate, ContactUpdate, SocialMediaUpdate
from app.utils.mysql_connection import get_db
from app.security.security import get_api_key

router = APIRouter(prefix="/config", tags=["config"])


@router.put("/website/{idConfig}", response_model=dict)
def update_website(
    idConfig: int,
    update_data: WebsiteUpdate,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor()
    cursor.execute("SELECT idConfig FROM config WHERE idConfig = %s", (idConfig,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Config not found")

    set_clauses = []
    values = []
    if update_data.websiteName is not None:
        set_clauses.append("websiteName = %s")
        values.append(update_data.websiteName)
    if update_data.websiteDescription is not None:
        set_clauses.append("websiteDescription = %s")
        values.append(update_data.websiteDescription)
    if update_data.websiteKeywords is not None:
        set_clauses.append("websiteKeywords = %s")
        values.append(update_data.websiteKeywords)
    if update_data.logo is not None:
        set_clauses.append("logo = %s")
        values.append(update_data.logo)

    if not set_clauses:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    values.append(idConfig)
    query = f"UPDATE config SET {', '.join(set_clauses)} WHERE idConfig = %s"

    try:
        cursor.execute(query, values)
        db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Config not found")
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
