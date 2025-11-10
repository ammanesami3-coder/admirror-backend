# backend/app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from backend.app.models import User
from backend.app.routers.users import require_role  # لإعادة استخدام حماية المسؤول

router = APIRouter(prefix="/admin", tags=["Admin"])

# -----------------------------
# عرض جميع المستخدمين (Admin only)
# -----------------------------
@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    users = db.query(User).all()
    return {
        "count": len(users),
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role.value,
                "is_active": u.is_active,
                "created_at": u.created_at
            }
            for u in users
        ]
    }
# -----------------------------
# إحصاءات عامة للنظام (Admin only)
# -----------------------------
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(require_role("admin"))):
    total_users = db.query(User).count()
    
    # يمكنك إضافة مزيد من الجداول لاحقاً مثل الإعلانات أو الطلبات
    stats = {
        "total_users": total_users,
        "active_users": db.query(User).filter(User.is_active == True).count(),
    }
    return {"message": "Dashboard stats fetched successfully", "data": stats}
