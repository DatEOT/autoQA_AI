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
    config,
)
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi

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
app.include_router(config.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Question Generator API"}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Question Generator API",
        version="1.0.0",
        description="API tạo câu hỏi theo cấp độ Bloom",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"},
        "apiKeyAuth": {"type": "apiKey", "in": "header", "name": "API-Key"},
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", []).append({"bearerAuth": []})
            method.setdefault("security", []).append({"apiKeyAuth": []})

    app.openapi_schema = openapi_schema
    return app.openapi_schema
