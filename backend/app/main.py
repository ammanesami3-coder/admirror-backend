from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import users, ads, analysis

app = FastAPI(
    title="AdMirror API",
    version="1.0.0",
    description="API for analyzing and generating Instagram ads using AI"
)

# تفعيل CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# إنشاء الجداول مرة واحدة فقط عند التشغيل
@app.on_event("startup")
def on_startup():
    init_db()

# تسجيل المسارات
app.include_router(users.router)
app.include_router(ads.router)
app.include_router(analysis.router)

@app.get("/")
def root():
    return {"message": "Welcome to AdMirror API"}
