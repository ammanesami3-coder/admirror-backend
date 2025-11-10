import os, base64, pathlib, time
from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFont

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY غير موجود في ملف .env")

client = OpenAI(api_key=OPENAI_API_KEY)

# =====================================================
# 🔍 تحليل نص الإعلان
# =====================================================
def analyze_ad_text(ad_text: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "أنت خبير تسويق رقمي وتحليل إعلانات سوشيال ميديا."},
            {"role": "user", "content": f"حلل الإعلان التالي:\n{ad_text}"}
        ]
    )

    analysis_text = response.choices[0].message.content.strip()

    # حساب Score تقريبي بناءً على وجود كلمات إيجابية/تحفيزية
    score = 70
    if any(word in ad_text.lower() for word in ["offer", "deal", "save", "best", "discount"]):
        score += 15
    elif any(word in ad_text.lower() for word in ["bad", "boring", "slow"]):
        score -= 15

    score = max(0, min(score, 100))  # التأكد أن النتيجة بين 0 و 100

    return {
        "input_text": ad_text,
        "analysis": analysis_text,
        "score": score
    }


# =====================================================
# ✨ توليد نص إعلان جديد
# =====================================================
def generate_new_ad(ad_text: str, tone="friendly", platform="instagram") -> dict:
    prompt = (
        f"أنشئ جملة إعلانية قصيرة لا تتجاوز 7 كلمات بالعربية الفصحى، جذابة ومقنعة. "
        f"النص الأصلي: «{ad_text}». "
        f"احرص أن تكون بسيطة ومناسبة لمنصة {platform}. "
        f"بدون رموز، وبدون تكرار كلمات."
    )
    resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], max_tokens=40)
    return {"generated_text": resp.choices[0].message.content.strip()}


# =====================================================
# 🖼️ توليد صورة واقعية احترافية
# =====================================================
def generate_ad_image(prompt: str, size: str = "1024x1024") -> dict:
    import traceback
    import base64, pathlib, time

    safe_prompt = (
        f"Professional commercial photography, cinematic lighting, realistic composition. "
        f"Modern social media ad photo. No text, no words, no watermarks, no logos. "
        f"Concept: {prompt}"
    )

    try:
        print("🧠 توليد صورة باستخدام GPT-Image-1 ...")
        try:
            resp = client.images.generate(
                model="gpt-image-1",
                prompt=safe_prompt,
                size=size,
                quality="high"
            )
        except Exception:
            resp = client.images.generate(
                model="gpt-image-1",
                prompt=safe_prompt,
                size=size
            )

        if not resp or not resp.data:
            raise ValueError("⚠️ لا توجد بيانات في استجابة OpenAI Image API")

        b64 = resp.data[0].b64_json
        if not b64:
            raise ValueError("⚠️ استجابة الصورة فارغة (b64_json مفقود)")

        img_bytes = base64.b64decode(b64)
        out = pathlib.Path(f"generated_{int(time.time() * 1000)}.png")
        out.write_bytes(img_bytes)

        final_url = f"file://{out.resolve()}"
        print(f"✅ تم حفظ الصورة: {final_url}")

        return {"prompt": prompt, "image_url": final_url}

    except Exception as e:
        print("❌ خطأ أثناء توليد الصورة:\n", traceback.format_exc())
        return {"prompt": prompt, "image_url": None}


# =====================================================
# 📝 كتابة النص العربي على الصورة
# =====================================================
def render_arabic_text_on_image(
    image_path: str,
    text: str,
    font_path: str = "C:/Windows/Fonts/Arial.ttf",
    font_size: int = 64,
):
    import arabic_reshaper
    from bidi.algorithm import get_display

    try:
        im = Image.open(image_path).convert("RGBA")
    except Exception:
        return None

    W, H = im.size
    txt_layer = Image.new("RGBA", im.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(txt_layer)
    font = ImageFont.truetype(font_path, font_size)

    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    bbox = draw.textbbox((0, 0), bidi_text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (W - tw) / 2
    y = H * 0.82

    draw.rectangle([(x - 20, y - 10), (x + tw + 20, y + th + 10)], fill=(0, 0, 0, 120))
    draw.text((x, y), bidi_text, font=font, fill=(255, 255, 255, 255))

    combined = Image.alpha_composite(im, txt_layer)
    out = pathlib.Path(image_path).with_name("final_" + pathlib.Path(image_path).name)
    combined.convert("RGB").save(out, "PNG")
    return str(out.resolve())


# =====================================================
# 🧠 تحليل الصورة الإعلانية (GPT-4o Vision)
# =====================================================
def analyze_ad_image(image_url: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "أنت خبير تسويق بصري تحلل الصور الإعلانية."},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "حلل الصورة التالية من حيث النغمة التسويقية والعناصر البصرية:"},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            },
        ],
    )

    visual_analysis = response.choices[0].message.content.strip()

    # توليد Score تقديري بناءً على الكلمات المفتاحية
    score = 70
    if any(word in visual_analysis.lower() for word in ["attractive", "professional", "eye-catching", "vivid"]):
        score += 20
    elif any(word in visual_analysis.lower() for word in ["blurry", "dark", "unclear"]):
        score -= 20

    score = max(0, min(score, 100))

    return {
        "image_url": image_url,
        "visual_analysis": visual_analysis,
        "score": score
    }
