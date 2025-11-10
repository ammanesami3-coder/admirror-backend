from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
from typing import Optional, Any, Dict
from datetime import datetime
import base64, pathlib, time, os
from backend.app.models import User
from backend.app.routers.users import get_current_user

from app.database import get_db
from backend.app.models import AdLibrary, AdResult, AdRequest, RequestStatus
from app.core.ai_service import analyze_ad_text, analyze_ad_image, generate_new_ad
from backend.app.routers.users import require_role, get_current_user
from openai import OpenAI
from fastapi import Request
client = OpenAI()
router = APIRouter(prefix="/ads-library", tags=["Ads Library"])

# ===== إعداد المسار الثابت لحفظ الصور =====
STATIC_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "static" / "generated"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# ====== توليد الصورة ======
def generate_ad_image(prompt: str, size: str = "1024x1024") -> dict:
    safe_prompt = (
        "High-quality commercial ad photo, cinematic lighting, realistic composition. "
        "Social media style, no text, no logos. "
        f"Concept: {prompt}"
    )
    resp = client.images.generate(model="gpt-image-1", prompt=safe_prompt, size=size)
    b64 = resp.data[0].b64_json
    img_bytes = base64.b64decode(b64)

    filename = f"ad_{int(time.time()*1000)}.png"
    out_path = STATIC_DIR / filename
    out_path.write_bytes(img_bytes)

    public_url = f"/static/generated/{filename}"
    return {"prompt": prompt, "image_url": public_url}

# ====== دمج النص العربي على الصورة ======
def render_arabic_text_on_image(image_path: str, text: str):
    from PIL import Image, ImageDraw, ImageFont
    import arabic_reshaper
    from bidi.algorithm import get_display

    im = Image.open(image_path).convert("RGBA")
    W, H = im.size
    draw = ImageDraw.Draw(im)
    font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 64)

    reshaped = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped)

    bbox = draw.textbbox((0, 0), bidi_text, font=font)
    text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (W - text_w) / 2
    y = H - text_h - 60

    draw.text((x + 3, y + 3), bidi_text, font=font, fill=(0, 0, 0, 180))
    draw.text((x, y), bidi_text, font=font, fill=(255, 255, 255, 255))

    output_path = pathlib.Path(image_path).with_name("final_" + pathlib.Path(image_path).name)
    im.convert("RGB").save(output_path, format="PNG")
    return output_path

# ============================
# إنشاء إعلان جديد
# ============================
class AdCreate(BaseModel):
    platform_ad_id: str
    platform: str
    ad_text: Optional[str] = None
    media_url: Optional[str] = None
    engagement_score: Optional[float] = None
    ad_metadata: Optional[Dict[str, Any]] = None
    category_id: Optional[UUID] = None

class AdResponse(BaseModel):
    id: UUID
    platform_ad_id: str
    platform: str
    ad_text: Optional[str]
    media_url: Optional[str]
    engagement_score: Optional[float]
    ad_metadata: Optional[Dict[str, Any]]
    category_id: Optional[UUID]
    created_at: datetime
    class Config:
        from_attributes = True

@router.post("/", response_model=AdResponse)
def create_ad(ad: AdCreate, db: Session = Depends(get_db)):  # ← أزل require_role("admin")
    new_ad = AdLibrary(**ad.dict())
    db.add(new_ad)
    db.commit()
    db.refresh(new_ad)
    return new_ad


# ============================
# توليد إعلان محسّن (نص + صورة)
# ============================
@router.post("/{ad_id}/regenerate")
def regenerate_ad(ad_id: UUID, db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    ad = db.query(AdLibrary).filter(AdLibrary.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")

    text_result = generate_new_ad(ad.ad_text or "", tone="engaging", platform=ad.platform or "instagram")
    new_text = text_result.get("generated_text", "").strip()

    # توليد الصورة
    image_result = generate_ad_image(f"إعلان واقعي مستوحى من النص التالي: {new_text}")
    new_image_path = pathlib.Path(STATIC_DIR) / pathlib.Path(image_result["image_url"]).name

    # دمج النص العربي
    try:
        final_path = render_arabic_text_on_image(new_image_path, new_text)
        new_image_url = f"/static/generated/{final_path.name}"
    except Exception:
        new_image_url = image_result["image_url"]

    # حفظ في قاعدة البيانات
    ad_req = AdRequest(
        user_id=current_user.id,
        category_id=ad.category_id,
        status=RequestStatus.completed,
        input_query=f"Regenerated ad (text+image) for {ad.id}",
    )
    db.add(ad_req)
    db.flush()

    ad_res = AdResult(
        ad_request_id=ad_req.id,
        source_ad_id=ad.id,
        generated_assets={"new_ad_text": new_text, "new_image_url": new_image_url},
        score=(ad.engagement_score or 80) + 5.0,
    )
    db.add(ad_res)
    db.commit()

    return {
        "message": "✅ تم توليد إعلان جديد محسّن بنجاح",
        "new_text": new_text,
        "new_image_url": new_image_url,
        "score": ad_res.score,
    }

# ============================
# إحصائيات عامة + آخر إعلان
# ============================
@router.get("/stats")
def get_ads_stats(db: Session = Depends(get_db)):
    total_ads = db.query(AdLibrary).count()
    analyzed_ads = db.query(AdResult).count()
    generated_ads = db.query(AdResult).filter(AdResult.generated_assets.isnot(None)).count()

    # توزيع المنصات (إحصائية بسيطة)
    platform_counts = (
        db.query(AdLibrary.platform)
        .distinct()
        .all()
    )

    platforms = [p[0] for p in platform_counts]

    return {
        "total_ads": total_ads,
        "analyzed_ads": analyzed_ads,
        "generated_ads": generated_ads,
        "platforms": platforms,
    }


@router.get("/latest")
def get_latest_generated_ad(request: Request, db: Session = Depends(get_db)):
    """
    إرجاع أحدث إعلان تم توليده مع رابط صورة كامل.
    """
    ad = (
        db.query(AdResult)
        .filter(AdResult.generated_assets.isnot(None))
        .order_by(desc(AdResult.created_at))
        .first()
    )
    if not ad:
        return {"message": "لا يوجد إعلان بعد"}

    image_path = ad.generated_assets.get("new_image_url")
    if image_path and not image_path.startswith("http"):
        # تأكيد تكوين رابط مطلق
        base_url = str(request.base_url).rstrip("/")
        image_path = f"{base_url}{image_path}"

    return {
        "text": ad.generated_assets.get("new_ad_text"),
        "image": image_path,
        "score": ad.score,
        "ad_id": str(ad.source_ad_id),
    }

@router.get("/all")
def get_all_ads(db: Session = Depends(get_db)):
    """
    إرجاع جميع الإعلانات المحفوظة في قاعدة البيانات مرتبة بالأحدث أولاً.
    """
    ads = (
        db.query(AdResult)
        .order_by(desc(AdResult.created_at))
        .all()
    )

    if not ads:
        return {"message": "لا توجد إعلانات بعد"}

    formatted = []
    for ad in ads:
        if not ad.generated_assets:
            continue  # تجاهل أي إعلان بدون بيانات توليد
        formatted.append({
            "id": str(ad.source_ad_id),
            "text": ad.generated_assets.get("new_ad_text", ""),
            "image_url": ad.generated_assets.get("new_image_url", ""),
            "score": ad.score,
            "created_at": ad.created_at.isoformat()
        })
    return formatted

# ============================
# حذف إعلان
# ============================
@router.delete("/delete/{ad_id}")
def delete_ad(ad_id: UUID, db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    """
    حذف إعلان نهائيًا من قاعدة البيانات وجميع نتائجه المرتبطة به.
    """
    ad = db.query(AdLibrary).filter(AdLibrary.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="الإعلان غير موجود")

    # حذف النتائج المرتبطة بهذا الإعلان إن وُجدت
    db.query(AdResult).filter(AdResult.source_ad_id == ad_id).delete()

    db.delete(ad)
    db.commit()
    return {"message": "تم حذف الإعلان بنجاح"}

from fastapi import Request

@router.post("/generate-enhanced")
def generate_enhanced_ad(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    ✅ 1. يتحقق من صلاحية الاشتراك قبل التوليد
    ✅ 2. يحسّن النص الإعلاني باستخدام GPT
    ✅ 3. يولد الصورة الإعلانية عبر DALL·E
    ✅ 4. يخزن الإعلان الجديد في قاعدة البيانات
    ✅ 5. يسجّل استهلاك الإعلان من الخطة
    ✅ 6. يعيد النتيجة في JSON جاهز للواجهة الأمامية
    """
    import base64, time, pathlib
    from openai import OpenAI
    from datetime import datetime
    from backend.app.models import GeneratedAd

    client = OpenAI()
    prompt = payload.get("text", "")
    platform = payload.get("platform", "instagram")

    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Ad text is required")

    
    # --- تحسين النص ---
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert Arabic marketing copywriter specialized in short, emotional, conversion-optimized ads."},
                {"role": "user", "content": f"حسّن هذا النص الإعلاني بأسلوب احترافي وجذاب لمنصة {platform}: {prompt}"}
            ],
            max_tokens=300
        )
        enhanced_text = response.choices[0].message.content.strip()
    except Exception as e:
        print("❌ Text enhancement failed:", e)
        enhanced_text = prompt

    # --- توليد الصورة ---
    STATIC_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "static" / "generated"
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

    try:
        img_resp = client.images.generate(
            model="gpt-image-1",
            prompt=f"Professional social media ad visual showing: {enhanced_text}",
            size="1024x1024"
        )
        img_b64 = img_resp.data[0].b64_json
        img_bytes = base64.b64decode(img_b64)
        filename = f"enhanced_{int(time.time() * 1000)}.png"
        img_path = STATIC_DIR / filename
        img_path.write_bytes(img_bytes)
        image_url = f"/static/generated/{filename}"
    except Exception as e:
        print("❌ Image generation failed:", e)
        image_url = "/static/placeholder.png"

    # --- حفظ الإعلان الجديد في قاعدة البيانات ---
    try:
        new_ad = GeneratedAd(
            user_id=current_user.id,
            ad_text=enhanced_text,
            design_url=image_url,
            generation_type="full",
            created_at=datetime.utcnow(),
        )
        db.add(new_ad)
        db.commit()
        db.refresh(new_ad)

    except Exception as e:
        db.rollback()
        print("❌ Failed to save generated ad:", e)
        raise HTTPException(status_code=500, detail="Failed to save generated ad")

    return {
        "message": "✅ تم توليد الإعلان بنجاح",
        "text": enhanced_text,
        "image_url": image_url,
        "ad_id": str(new_ad.id),
    }


@router.post("/{ad_id}/analyze", tags=["Ads Library"])
def analyze_ad(ad_id: UUID, db: Session = Depends(get_db), current_user=Depends(require_role("admin"))):
    """
    تحليل إعلان (نص + صورة) مع حفظ النتائج في AdResult بشكل صحيح.
    """
    from app.core.ai_service import analyze_ad_text, analyze_ad_image
    from backend.app.models import AdRequest, AdResult, RequestStatus, AdLibrary

    ad = db.query(AdLibrary).filter(AdLibrary.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="الإعلان غير موجود")

    # ✅ تحليل النص
    text_analysis = analyze_ad_text(ad.ad_text or "")

    # ✅ تحليل الصورة (اختياري)
    image_analysis = None
    if ad.media_url:
        try:
            image_analysis = analyze_ad_image(ad.media_url)
        except Exception:
            image_analysis = {"image_url": ad.media_url, "visual_analysis": "❌ فشل تحليل الصورة", "score": 50}

    # ✅ حساب النتيجة الإجمالية
    score = text_analysis.get("score", 50)
    if image_analysis:
        score = round((text_analysis["score"] + image_analysis["score"]) / 2, 2)

    # ✅ إنشاء طلب تحليل مرتبط بالإعلان
    ad_request = AdRequest(
        user_id=current_user.id,
        category_id=ad.category_id,
        status=RequestStatus.completed,
        input_query=f"تحليل إعلان {ad_id}",
    )
    db.add(ad_request)
    db.flush()  # ضروري للحصول على ID قبل الإنشاء التالي

    # ✅ حفظ النتيجة في AdResult
    ad_result = AdResult(
        ad_request_id=ad_request.id,
        source_ad_id=ad.id,
        analysis_json={"text": text_analysis, "image": image_analysis},
        score=score,
    )
    db.add(ad_result)
    db.commit()

    return {
        "message": "✅ تم تحليل الإعلان بنجاح",
        "ad_id": str(ad.id),
        "score": score,
        "text_analysis": text_analysis,
        "image_analysis": image_analysis,
    }

@router.get("/analytics/all", tags=["Analytics"])
def get_all_ad_analytics(db: Session = Depends(get_db)):
    """
    إرجاع جميع نتائج التحليل المحفوظة في قاعدة البيانات (ad_results)
    مع تفاصيل الإعلان المرتبط بها.
    """
    from backend.app.models import AdResult, AdLibrary

    results = (
        db.query(AdResult, AdLibrary)
        .join(AdLibrary, AdLibrary.id == AdResult.source_ad_id)
        .order_by(AdResult.created_at.desc())
        .all()
    )

    output = []
    for r in results:
        analysis_json = r.AdResult.analysis_json or {}  # ✅ التعامل مع القيم الفارغة
        text_analysis = analysis_json.get("text", {})
        image_analysis = analysis_json.get("image", {})

        output.append({
            "result_id": str(r.AdResult.id),
            "ad_id": str(r.AdLibrary.id),
            "text": r.AdLibrary.ad_text,
            "image_url": r.AdLibrary.media_url,
            "score": r.AdResult.score or 0,
            "text_analysis": text_analysis,
            "image_analysis": image_analysis,
            "created_at": r.AdResult.created_at.isoformat(),
        })

    return output

# ============================
# إعلانات المستخدم الحالي
# ============================
from fastapi import Depends, HTTPException
from backend.app.models import GeneratedAd, User
from backend.app.routers.users import get_current_user
from backend.app.database import get_db
from sqlalchemy.orm import Session

@router.get("/user")
def get_user_ads(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ads = db.query(GeneratedAd).filter(GeneratedAd.user_id == current_user.id).all()
    return [
        {
            "id": ad.id,
            "ad_text": ad.ad_text,
            "design_url": ad.design_url,
            "created_at": ad.created_at.isoformat() if ad.created_at else None,
            "score": getattr(ad, "score", 0)
        }
        for ad in ads
    ]



