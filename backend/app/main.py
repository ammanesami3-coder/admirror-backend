import os
import sys
import pathlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# -------- ضبط المسار الأساسي --------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# -------- استيراد التهيئة وقاعدة البيانات --------
from backend.app.database import init_db
from backend.app.routers import (
    users,
    admin,
    ads,
    analysis,
    plans,
    ads_library,
    categories,
    admin_users,
    auth,
)

# -------- إنشاء التطبيق --------
app = FastAPI(
    title="AdMirror API",
    version="1.0.0",
    description="API for analyzing and generating ads using AI",
)

# -------- إعداد CORS --------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # غيّرها لاحقًا للنطاق الموثوق فقط في الإنتاج
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- تهيئة static للصور --------
STATIC_DIR = os.path.join(BASE_DIR, "static", "generated")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# -------- عند تشغيل التطبيق --------
@app.on_event("startup")
def on_startup():
    init_db()

# -------- تضمين الراوترات --------
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(ads.router)
app.include_router(analysis.router)
app.include_router(plans.router)
app.include_router(ads_library.router)
app.include_router(categories.router)
app.include_router(admin_users.router)

# -------- الصفحة الرئيسية --------
@app.get("/")
def root():
    return {"message": "Welcome to AdMirror API"}

# -------- إعادة ربط static (مسار عام للملفات المحلية) --------
static_dir = pathlib.Path().resolve()
app.mount("/static", StaticFiles(directory=static_dir), name="static")


