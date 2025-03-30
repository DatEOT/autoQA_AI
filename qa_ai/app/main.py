from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import question, auth, users, role

# Tạo instance FastAPI
app = FastAPI()

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


@app.get("/")
def read_root():
    return {"message": "Welcome to the Question Generator API"}
