# backend/app/main.py
import os, sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# نجعل بايثون يرى مجلد backend كـ PYTHONPATH عند التشغيل محليًا أو على Render
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.database import init_db  # الآن متاح
from app.routers import users, ads, analysis

app = FastAPI(
    title="AdMirror API",
    version="1.0.0",
    description="API for analyzing and generating Instagram ads using AI",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(users.router)
app.include_router(ads.router)
app.include_router(analysis.router)

@app.get("/")
def root():
    return {"message": "Welcome to AdMirror API"}
