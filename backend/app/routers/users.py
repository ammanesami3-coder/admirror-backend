# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from typing import Optional, List
from uuid import UUID

from backend.app.database import get_db
from backend.app.models import User, UserRole
from backend.app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/users", tags=["Users"])
# --- Bootstrap one-time admin ---
import os
from fastapi import Body

@router.post("/bootstrap-admin")
def bootstrap_admin(
    secret: str = Body(..., embed=True),
    email: EmailStr | None = Body(None),
    password: str | None = Body(None),
    db: Session = Depends(get_db),
):
    # حماية بسيطة بكلمة سر من .env
    BOOTSTRAP_SECRET = os.getenv("BOOTSTRAP_SECRET", "dev-bootstrap")
    if secret != BOOTSTRAP_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

    # إذا كان يوجد Admin مسبقاً لا ننشئ آخر
    existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
    if existing_admin:
        return {"detail": "admin_already_exists"}

    admin_email = email or os.getenv("ADMIN_EMAIL", "admin@adm.com")
    admin_pass = password or os.getenv("ADMIN_PASSWORD", "Admin#12345")

    user = User(
        email=admin_email,
        password_hash=hash_password(admin_pass),
        full_name="Super Admin",
        role=UserRole.admin,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"detail": "admin_created", "email": admin_email}

# =========================
# الإعدادات الأمنية
# =========================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")
security = HTTPBearer()

# =========================
# دوال مساعدة
# =========================
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# =========================
# Schemas
# =========================
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: Optional[str] = None  # نص بدل datetime
    class Config:
        from_attributes = True

# =========================
# المسارات العامة
# =========================
@router.post("/register", response_model=UserOut)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    from datetime import timedelta

    # 🟢 التحقق من البريد المكرر
    exists = db.query(User).filter(User.email == user_data.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 🟢 إنشاء المستخدم
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        is_active=True,
        role=UserRole.user,
    )
    db.add(new_user)
    db.flush()  # ضروري للحصول على new_user.id



    db.commit()
    db.refresh(new_user)

    return new_user



@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.email, "role": user.role.value})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.value,  # 👈 نضيف هذا السطر
    }



@router.get("/me", response_model=UserOut)
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# =========================
# التحقق من الصلاحيات (require_role)
# =========================
def require_role(required_role: str):
    def checker(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            role: str = payload.get("role")
            if not email or not role:
                raise HTTPException(status_code=401, detail="Invalid token")
            if role != required_role:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            user = db.query(User).filter(User.email == email).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return user
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    return checker

# =========================
# مسارات الإدارة (للمشرف)
# =========================
class UserAdminCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.user

@router.post("/create", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserAdminCreate, db: Session = Depends(get_db), _=Depends(require_role("admin"))):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/all", response_model=List[UserOut], dependencies=[Depends(require_role("admin"))])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    out = []
    for u in users:
        out.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value if hasattr(u.role, "value") else u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return out

@router.delete("/{user_id}", status_code=204, dependencies=[Depends(require_role("admin"))])
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"detail": "deleted"}


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

# =========================
# إحصائيات المستخدم (User Stats)
# =========================
from backend.app.models import GeneratedAd

@router.get("/stats")
def user_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_ads = db.query(GeneratedAd).filter(GeneratedAd.user_id == current_user.id).count()
    created_date = current_user.created_at.isoformat() if current_user.created_at else None
    return {
        "email": current_user.email,
        "full_name": current_user.full_name,
        "joined": created_date,
        "total_ads": total_ads,
        "role": current_user.role.value if hasattr(current_user.role, "value") else current_user.role
    }

from backend.app.models import GeneratedAd

@router.get("/my-ads")
def get_user_generated_ads(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ads = (
        db.query(GeneratedAd)
        .filter(GeneratedAd.user_id == current_user.id)
        .order_by(GeneratedAd.created_at.desc())
        .all()
    )

    return [
        {
            "id": ad.id,
            "text": ad.text,
            "image_url": ad.image_url,
            "score": ad.score,
            "created_at": ad.created_at.isoformat() if ad.created_at else None,
        }
        for ad in ads
    ]
