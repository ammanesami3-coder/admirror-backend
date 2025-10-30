## 🧩 AdMirror — System Architecture

### 1. Overview

AdMirror هي منصة SaaS لتحليل الإعلانات الناجحة على إنستغرام وتوليد حملات محسّنة باستخدام الذكاء الاصطناعي.
تعتمد المنصة على بنية مرنة قابلة للتوسّع وتخدم ثلاثة أغراض رئيسية:

1. جمع الإعلانات من **Meta Ads Library** وتحليلها.
2. استخراج الأنماط التسويقية واستراتيجيات النجاح.
3. توليد إعلانات جديدة محسّنة تلقائيًا للمستخدمين.

---

### 2. Core Components

| الطبقة                         | التقنية                        | الدور                                                    |
| ------------------------------ | ------------------------------ | -------------------------------------------------------- |
| **Frontend**                   | Next.js + TailwindCSS + ShadCN | واجهة المستخدم، عرض النتائج والتقارير التفاعلية          |
| **Backend**                    | FastAPI                        | المنطق الخلفي، إدارة الاتصال بالذكاء الاصطناعي والـ APIs |
| **Database**                   | PostgreSQL                     | تخزين بيانات الإعلانات والمستخدمين والتقارير             |
| **AI Layer**                   | OpenAI + Replicate + Whisper   | التحليل النصي والبصري وتوليد الإعلانات                   |
| **Storage**                    | AWS S3                         | تخزين الصور والفيديوهات الخاصة بالإعلانات                |
| **CI/CD**                      | GitHub Actions + Render/Vercel | أتمتة النشر، بناء النسخ، مراقبة الأداء                   |
| **Documentation & Management** | Notion + GitHub Wiki           | التوثيق الكامل لإدارة المشروع والفِرق                    |

---

### 3. Data Flow

1. المستخدم يدخل كلمة مفتاحية أو رابط إعلان.
2. النظام يرسل الطلب إلى **Meta Ads Library API** لاسترجاع الإعلانات المطابقة.
3. تُخزن النتائج في قاعدة البيانات PostgreSQL.
4. وحدة التحليل الذكي (AI Analysis) تقوم باستخراج الأنماط التسويقية وتحليل النص والصورة والفيديو.
5. تُولد المنصة تقريرًا تحليليًا (AdMirror Report) بصيغة JSON.
6. يمكن للمستخدم استخدام التقرير لتوليد إعلان جديد عبر وحدة **Ad Generation**.
7. النتيجة النهائية (نص، هاشتاغات، صور، فيديو) تُخزن في S3 وتُعرض في واجهة المستخدم.

---

### 4. Directory Structure

```
admirror/
│
├── frontend/            # Next.js UI
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── utils/
│
├── backend/             # FastAPI server
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── db/
│   └── ai/
│
├── docs/                # Documentation
│   ├── architecture.md
│   ├── api_endpoints.md
│   └── db_schema.md
│
├── .github/workflows/   # CI/CD pipelines
└── docker-compose.yml   # Local development setup
```

---

### 5. Security & Scalability

* **Authentication:** Firebase Auth (OAuth 2.0 / Email).
* **Authorization:** Role-based (User / Admin).
* **API Security:** JWT tokens + HTTPS enforced.
* **Caching:** Redis لزيادة سرعة الاستجابة.
* **Scalability:** إمكانية التوسّع الأفقي عبر Docker + Kubernetes مستقبلاً.

---

### 6. Integration Map

| API / Service              | الاستخدام                        |
| -------------------------- | -------------------------------- |
| **Meta Ads Library API**   | جلب بيانات الإعلانات من إنستغرام |
| **OpenAI GPT-4**           | تحليل النصوص وتوليد الإعلانات    |
| **Replicate (CLIP, BLIP)** | تحليل الصور والفيديوهات        |
| **Whisper API**            | تحليل الصوت داخل الفيديوهات    |
| **Stripe API**             | إدارة الاشتراكات والفواتير       |
| **AWS S3**                 | تخزين الوسائط                    |

---

### 7. Future Extensions

* وحدة تحليل منافسين.
* API خارجي للشركات.
* نظام AdMirror Index لتقارير السوق الشهرية.
