from fastapi import APIRouter, Depends, HTTPException, Path, Query
import pymysql
from app.utils.mysql_connection import get_db
from app.models.blog import BlogCreate, BlogUpdate, BlogOut
from app.security.security import get_api_key

router = APIRouter(prefix="/blogs", tags=["Blogs"])


@router.post("/CreateBlog", response_model=BlogOut)
def create_blog(
    blog: BlogCreate,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)
    cursor.execute(
        """
        INSERT INTO blogs (title, content, image_url)
        VALUES (%s, %s, %s)
        """,
        (blog.title, blog.content, blog.image_url),
    )
    db.commit()
    blog_id = cursor.lastrowid

    cursor.execute(
        "SELECT id, title, content, image_url FROM blogs WHERE id = %s", (blog_id,)
    )
    new_blog = cursor.fetchone()
    return new_blog


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
    blog: BlogUpdate = ...,
    db: pymysql.connections.Connection = Depends(get_db),
    api_key: str = get_api_key,
):
    cursor = db.cursor(pymysql.cursors.DictCursor)

    cursor.execute("SELECT * FROM blogs WHERE id = %s", (blog_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Blog not found")

    cursor.execute(
        """
        UPDATE blogs
        SET title = %s, content = %s, image_url = %s
        WHERE id = %s
        """,
        (blog.title, blog.content, blog.image_url, blog_id),
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
    cursor = db.cursor()
    cursor.execute("SELECT id FROM blogs WHERE id = %s", (blog_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Blog not found")

    cursor.execute("DELETE FROM blogs WHERE id = %s", (blog_id,))
    db.commit()
    return {"message": f"Blog ID {blog_id} đã được xóa thành công"}
