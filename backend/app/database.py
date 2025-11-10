# backend/app/database.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base

# ------------------------
# تحميل القيم من ملف .env
# ------------------------
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# ------------------------
# إعداد الاتصال بقاعدة البيانات
# ------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not set in .env file")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ------------------------
# جلسة قاعدة البيانات
# ------------------------
def get_db():
    """تُرجع جلسة اتصال جاهزة مع قاعدة البيانات."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------
# تهيئة قاعدة البيانات (إنشاء الجداول)
# ------------------------
def init_db():
    """إنشاء جميع الجداول إذا لم تكن موجودة."""
    from backend.app import models
    print("🛠️ Initializing database...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created or verified.")

    # فحص الجداول الموجودة وعرض الأعمدة الأساسية في جدول users
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"📦 Found tables: {tables}")

        if "users" in tables:
            columns = [col["name"] for col in inspector.get_columns("users")]
            print(f"📋 Columns in 'users': {columns}")
        else:
            print("⚠️ Table 'users' not found yet.")
    except Exception as e:
        print(f"⚠️ Could not inspect tables: {e}")
