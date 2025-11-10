# backend/app/routers/plans.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

from backend.app.database import get_db
from backend.app.routers.users import require_role

router = APIRouter(prefix="/plans", tags=["Plans"])

# -----------------------------
# نماذج الإدخال والإخراج
# -----------------------------
class PlanBase(BaseModel):
    name: str
    description: str | None = None
    price: float
    duration_days: int = 30
    features: dict | None = None
    is_active: bool = True


class PlanCreate(PlanBase):
    pass


class PlanResponse(PlanBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

