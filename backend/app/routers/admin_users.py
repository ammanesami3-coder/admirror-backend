from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from backend.app.database import get_db
from backend.app.models import User, Plan, UserRole
from backend.app.routers.users import require_role

router = APIRouter(prefix="/admin/users", tags=["Admin • Users"])

# ===== Schemas =====
class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.user
    plan_id: Optional[UUID] = None
    is_active: bool = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    plan_id: Optional[UUID] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str]
    role: UserRole
    plan_id: Optional[UUID]
    is_active: bool

    class Config:
        from_attributes = True


# ===== Endpoints =====
@router.get("/", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_role("admin"))):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db), _=Depends(require_role("admin"))):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email already exists")

    if payload.plan_id:
        plan = db.query(Plan).filter(Plan.id == payload.plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        plan_id=payload.plan_id,
        is_active=payload.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: UUID, payload: UserUpdate, db: Session = Depends(get_db), _=Depends(require_role("admin"))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.plan_id:
        plan = db.query(Plan).filter(Plan.id == payload.plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        user.role = payload.role
    if payload.plan_id is not None:
        user.plan_id = payload.plan_id
    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: UUID, db: Session = Depends(get_db), _=Depends(require_role("admin"))):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return None
