# backend/app/core/config.py
SECRET_KEY = "supersecretadmkey"  # استخدم نفس القيمة في جميع الملفات
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 ساعة
