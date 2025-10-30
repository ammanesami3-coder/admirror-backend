import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# قراءة متغير البيئة DATABASE_URL (سواء من Render أو ملف .env محلي)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not set. Please configure it in Render or .env")

# إنشاء محرك الاتصال بقاعدة البيانات
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# إعداد جلسة للتعامل مع قاعدة البيانات
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# تعريف القاعدة التي ستُورّث منها جميع النماذج
Base = declarative_base()
