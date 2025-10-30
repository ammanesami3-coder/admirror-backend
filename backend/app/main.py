import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ضبط المسار بشكل متوافق مع Render
sys.path.append(os.path.dirname(__file__))

# استيراد قاعدة البيانات بعد ضبط المسار
from database import init_db
from routers import users, ads, analysis

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

# إنشاء الجداول عند الإقلاع
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
