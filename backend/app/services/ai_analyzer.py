# backend/app/services/ai_analyzer.py
import re
from collections import Counter

# محلل نصي بسيط بدون استدعاء خارجي
def analyze_ad_text(text: str) -> dict:
    if not text:
        text = ""

    # مؤشرات أسلوب
    hooks = re.findall(r"(?:^|\n)(.+?)(?:\!|\?|:)", text)[:3]
    ctas = re.findall(r"(buy now|shop now|learn more|sign up|book now|order now|download|جرّب الآن|اشتر الآن|احجز الآن)", text, flags=re.I)
    hashtags = re.findall(r"#(\w+)", text)
    emojis = re.findall(r"[\U0001F300-\U0001FAFF]", text)

    # بساطة القراءة تقديرية
    words = re.findall(r"\w+", text)
    avg_word_len = sum(len(w) for w in words)/len(words) if words else 0
    sentences = re.split(r"[\.!\?]+", text)
    avg_sent_len = sum(len(s.split()) for s in sentences if s.strip())/max(1, len([s for s in sentences if s.strip()]))

    # الكلمات المفتاحية
    common = [w.lower() for w in words if len(w) > 3]
    top_keywords = [w for w, _ in Counter(common).most_common(10)]

    # تقدير نقاط
    score = 0
    score += min(len(hooks), 3) * 10
    score += min(len(ctas), 3) * 8
    score += min(len(hashtags), 8) * 2
    score += min(len(emojis), 6) * 1
    if 3 <= avg_sent_len <= 18: score += 12
    if avg_word_len <= 6: score += 8
    score = round(min(100, score), 2)

    suggestions = []
    if len(ctas) == 0: suggestions.append("أضف CTA واضحًا مثل: جرّب الآن / احجز الآن / تعرّف أكثر.")
    if len(hashtags) < 3: suggestions.append("استخدم 3–7 هاشتاغات دقيقة لزيادة الاكتشاف.")
    if not hooks: suggestions.append("ابدأ بجملة خطّاف قصيرة توضح الفائدة خلال أول 2–3 كلمات.")
    if avg_sent_len > 18: suggestions.append("قصّر الجمل. اجعل الجملة 8–15 كلمة لقراءة أسرع.")
    if avg_word_len > 6: suggestions.append("بسّط المفردات وقلّل الكلمات المركبة.")

    return {
        "tone": "informational" if avg_sent_len > 10 else "direct",
        "hooks": hooks,
        "ctas_detected": list(dict.fromkeys(ctas)),
        "hashtags": hashtags[:12],
        "emojis_count": len(emojis),
        "readability": {
            "avg_word_length": round(avg_word_len, 2),
            "avg_sentence_words": round(avg_sent_len, 2),
        },
        "top_keywords": top_keywords,
        "score": score,
        "suggestions": suggestions,
    }
