from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User  # تأكد أن لديك جدول User في models.py

router = APIRouter(prefix="/users", tags=["Users"])

# نقطة اختبار قاعدة البيانات
@router.get("/test-db")
def test_database_connection(db: Session = Depends(get_db)):
    try:
        # نحاول تنفيذ استعلام بسيط
        users_count = db.query(User).count()
        return {"status": "success", "message": f"Database connection OK. Users in table: {users_count}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
