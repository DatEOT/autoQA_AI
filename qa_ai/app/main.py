from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    question,
    auth,
    users,
    role,
    login_history,
    statistics,
    transaction_history,
    blogs,
)
from fastapi.staticfiles import StaticFiles


# Tạo instance FastAPI
app = FastAPI()


app.mount("/static", StaticFiles(directory="static"), name="static")


# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thêm router
app.include_router(question.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(role.router)
app.include_router(login_history.router)
app.include_router(statistics.router)
app.include_router(transaction_history.router)
app.include_router(blogs.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Question Generator API"}
