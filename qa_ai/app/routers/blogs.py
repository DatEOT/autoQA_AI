from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
    Query,
    UploadFile,
    File,
    Form,
)
import pymysql
from app.utils.mysql_connection import get_db
from app.models.blog import BlogCreate, BlogUpdate, BlogOut
from app.security.security import get_api_key
import os
from fastapi.responses import JSONResponse
from uuid import uuid4

router = APIRouter(prefix="/blogs", tags=["Blogs"])


@router.post("/CreateBlog", response_model=BlogOut)
def create_blog(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile = File(None),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    # Xử lý file ảnh (nếu có)
    image_url = ""
    if image:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid4().hex}.{ext}"
        image_path = os.path.join("static", "images", filename)
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        with open(image_path, "wb") as f:
            f.write(image.file.read())
        image_url = f"/static/images/{filename}"

    # Thêm vào database
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute(
        "INSERT INTO blogs (title, content, image_url) VALUES (%s, %s, %s)",
        (title, content, image_url),
    )
    db.commit()
    blog_id = cursor.lastrowid

    cursor.execute(
        "SELECT id, title, content, image_url FROM blogs WHERE id = %s", (blog_id,)
    )
    return cursor.fetchone()


@router.get("/ReadBlogAll", response_model=list[BlogOut])
def get_all_blogs(
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT id, title, content, image_url FROM blogs")
    return cursor.fetchall()


@router.get("/ReadBlog/{blog_id}", response_model=BlogOut)
def get_blog_by_id(
    blog_id: int = Path(..., gt=0),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute(
        "SELECT id, title, content, image_url FROM blogs WHERE id = %s", (blog_id,)
    )
    blog = cursor.fetchone()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@router.put("/UpdateBlog/{blog_id}", response_model=BlogOut)
def update_blog(
    blog_id: int = Path(..., gt=0),
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile = File(None),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)

    cursor.execute("SELECT * FROM blogs WHERE id = %s", (blog_id,))
    old_blog = cursor.fetchone()
    if not old_blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    image_url = old_blog["image_url"]
    if image:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid4().hex}.{ext}"
        image_path = os.path.join("static", "images", filename)
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        with open(image_path, "wb") as f:
            f.write(image.file.read())
        image_url = f"/static/images/{filename}"

    cursor.execute(
        "UPDATE blogs SET title = %s, content = %s, image_url = %s WHERE id = %s",
        (title, content, image_url, blog_id),
    )
    db.commit()

    cursor.execute(
        "SELECT id, title, content, image_url FROM blogs WHERE id = %s", (blog_id,)
    )
    return cursor.fetchone()


@router.delete("/DeleteBlog/{blog_id}")
def delete_blog(
    blog_id: int = Path(..., gt=0),
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)

    # 1. Lấy thông tin blog (đặc biệt là image_url)
    cursor.execute("SELECT image_url FROM blogs WHERE id = %s", (blog_id,))
    blog = cursor.fetchone()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    # 2. Xóa file ảnh nếu tồn tại
    image_url = blog["image_url"]
    if image_url:
        image_path = image_url.lstrip("/")
        if os.path.exists(image_path):
            os.remove(image_path)

    # 3. Xóa blog khỏi CSDL
    cursor.execute("DELETE FROM blogs WHERE id = %s", (blog_id,))
    db.commit()

    return {"message": f"Blog ID {blog_id} và ảnh đính kèm (nếu có) đã được xóa"}
