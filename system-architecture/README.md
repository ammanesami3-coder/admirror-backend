# 🧭 System Architecture Overview — AdMirror

هذا القسم يوضح البنية الكاملة لمشروع **AdMirror**، بما يشمل المكونات التقنية، قاعدة البيانات، وواجهات الـ API.

---

## 📂 هيكل الملفات

system-architecture/
├── architecture.md ← نظرة شاملة على البنية الكاملة (Frontend / Backend / AI / DB)
├── api_endpoints.md ← توثيق جميع الـ API Endpoints مع أمثلة الطلبات والاستجابات
├── db_schema.md ← تعريف الجداول، الحقول، وأنواع البيانات في قاعدة البيانات
└── database-design/
└── ERD-AdMirror.mmd ← المخطط العلائقي (Entity Relationship Diagram)

yaml
Copy code

---

## 📘 محتويات كل ملف

### 1. architecture.md  
يصف بنية النظام على مستوى المكونات:
- واجهة المستخدم (Next.js + Tailwind + ShadCN)  
- الخادم الخلفي (FastAPI)  
- طبقة الذكاء الاصطناعي (OpenAI + Replicate + Meta Ads Library)  
- قاعدة البيانات (PostgreSQL)  
- التخزين (AWS S3)  
- خطوط CI/CD وبيئة النشر (Render / Vercel)

---

### 2. api_endpoints.md  
يتضمن توثيق جميع النقاط التي يتواصل عبرها النظام:
- **POST /analyze-ad** → لتحليل إعلان  
- **POST /generate-ad** → لتوليد إعلان جديد  
- **GET /ads/{id}** → لجلب تفاصيل إعلان  
- **GET /reports/{id}** → لجلب تقارير التحليل  
- **POST /auth/register** و **/auth/login** → لإدارة المستخدمين

---

### 3. db_schema.md  
يعرض تفاصيل قاعدة البيانات:
- أسماء الجداول (Users, Projects, Ads, AnalysisReports, GeneratedAds, Payments)  
- أنواع الحقول (int, string, json, datetime...)  
- العلاقات بين الجداول  
- الفهارس (Indexes) والمفاتيح الأساسية (Primary Keys)

---

### 4. database-design/ERD-AdMirror.mmd  
يحتوي على كود **Mermaid** الذي يرسم مخطط العلاقات ERD بين الجداول.  
يمكن معاينته داخل VS Code باستخدام "Markdown Preview Mermaid Support".

---

## ⚙️ الغرض من هذا القسم
هذا الدليل موجه إلى:
- المطورين الجدد للانضمام إلى المشروع بسرعة.  
- المستثمرين لفهم الجوانب التقنية عند العرض التجاري.  
- فرق التطوير لتوثيق البنية بشكل احترافي وقابل للتوسع.

---

## 🧩 ملاحظات
- جميع الملفات قابلة للتحديث مع كل إصدار جديد من AdMirror.  
- الرجاء توثيق أي تعديل على قاعدة البيانات أو الـ API هنا مباشرة.  
- يُفضل استخدام تسميات ثابتة للملفات والتفرعات لضمان وضوح السجل التقني.

---

> **آخر تحديث:** {{ ضع تاريخ اليوم }}