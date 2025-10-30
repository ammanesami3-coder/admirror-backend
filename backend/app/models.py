# backend/app/models.py
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, DateTime, Enum, Float, ForeignKey, Boolean, DECIMAL, Text, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from .database import Base

# Enums (يمكن تعديل أو إضافة قيم لاحقًا)

from enum import Enum as PyEnum

class UserRole(PyEnum):
    user = "user"
    admin = "admin"

class PlanType(PyEnum):
    free = "free"
    pro = "pro"
    agency = "agency"

class RequestStatus(PyEnum):
    pending = "pending"
    processing = "processing"
    completed = "completed"

class GenerationType(PyEnum):
    text = "text"
    image = "image"
    video = "video"
    full = "full"

class PaymentStatus(PyEnum):
    pending = "pending"
    paid = "paid"
    failed = "failed"


# --------------------
# Users
# --------------------
class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=True)  # nullable if using OAuth/passwordless
    full_name = Column(String(120), nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.user)
    plan = Column(Enum(PlanType), nullable=False, default=PlanType.free)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    ad_requests = relationship("AdRequest", back_populates="user", cascade="all, delete-orphan")
    generated_ads = relationship("GeneratedAd", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")


# --------------------
# Plans (optional table if you want plan rows)
# --------------------
class Plan(Base):
    __tablename__ = "plans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False, unique=True)
    price = Column(DECIMAL, nullable=False, default=0)
    monthly_limit = Column(Integer, nullable=False, default=0)
    features = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", primaryjoin="Plan.id==User.plan", viewonly=True)


# --------------------
# Categories
# --------------------
class Category(Base):
    __tablename__ = "categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    ads = relationship("AdLibrary", back_populates="category")
    ad_requests = relationship("AdRequest", back_populates="category")


# --------------------
# Ads library (collected ads from Meta)
# --------------------
class AdLibrary(Base):
    __tablename__ = "ads_library"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform_ad_id = Column(String(255), nullable=True, index=True)
    platform = Column(String(50), nullable=False, default="instagram")
    ad_text = Column(Text, nullable=True)
    media_url = Column(Text, nullable=True)
    engagement_score = Column(Float, nullable=True)
    ad_metadata = Column(JSONB, nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="ads")
    analysis_reports = relationship("AdResult", back_populates="source_ad")


# --------------------
# Ad Requests (user requests to analyze/generate)
# --------------------
class AdRequest(Base):
    __tablename__ = "ad_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.pending, nullable=False)
    input_query = Column(Text, nullable=True)  # keyword or url provided by user
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ad_requests")
    category = relationship("Category", back_populates="ad_requests")
    ad_result = relationship("AdResult", back_populates="ad_request", uselist=False, cascade="all, delete-orphan")


# --------------------
# Ad Results (analysis + generated assets)
# --------------------
class AdResult(Base):
    __tablename__ = "ad_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ad_request_id = Column(UUID(as_uuid=True), ForeignKey("ad_requests.id"), nullable=False, unique=True)
    source_ad_id = Column(UUID(as_uuid=True), ForeignKey("ads_library.id"), nullable=True)
    analysis_json = Column(JSONB, nullable=True)    # output of AI analysis
    generated_assets = Column(JSONB, nullable=True) # metadata for generated assets (s3 paths, previews)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    ad_request = relationship("AdRequest", back_populates="ad_result")
    source_ad = relationship("AdLibrary", back_populates="analysis_reports")


# --------------------
# Generated Ads
# --------------------
class GeneratedAd(Base):
    __tablename__ = "generated_ads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    based_on_ad_id = Column(UUID(as_uuid=True), ForeignKey("ads_library.id"), nullable=True)
    generation_type = Column(Enum(GenerationType), nullable=False, default=GenerationType.full)
    ad_text = Column(Text, nullable=True)
    hashtags = Column(ARRAY(String), nullable=True)
    design_url = Column(Text, nullable=True)   # S3 preview path
    video_url = Column(Text, nullable=True)    # S3 video path
    recommendations = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="generated_ads")


# --------------------
# Transactions / Payments
# --------------------
class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan = Column(Enum(PlanType), nullable=False)
    amount = Column(DECIMAL, nullable=False)
    currency = Column(String(10), default="USD")
    stripe_session_id = Column(String(255), nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    payment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")


# --------------------
# Feedback
# --------------------
class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ad_request_id = Column(UUID(as_uuid=True), ForeignKey("ad_requests.id"), nullable=True)
    rating = Column(Integer, nullable=True)  # 1..5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
    # optional relationship to ad_request
    # ad_request = relationship("AdRequest", back_populates="feedbacks")

# Indexes (مثال)
Index("ix_ads_platform_ad_id", AdLibrary.platform_ad_id)
Index("ix_user_email", User.email)
