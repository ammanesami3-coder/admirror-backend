## 🧩 AdMirror — Database Schema

**Tech:** PostgreSQL + Prisma ORM (أو SQLAlchemy إذا فضلت FastAPI native)
**مبدأ التصميم:**

* قابل للتوسع أفقيًا.
* جميع العلاقات موثقة.
* الاعتماد على UUID كمفاتيح رئيسية.
* دعم multi-tenancy (لكل مستخدم بياناته وتحليلاته الخاصة).

---

### 1. جدول المستخدمين (`users`)

| الحقل           | النوع                       | الوصف                    |
| --------------- | --------------------------- | ------------------------ |
| `id`            | UUID (PK)                   | المعرف الفريد للمستخدم   |
| `email`         | VARCHAR(255)                | البريد الإلكتروني الفريد |
| `password_hash` | TEXT                        | كلمة المرور بعد التشفير  |
| `full_name`     | VARCHAR(120)                | اسم المستخدم             |
| `role`          | ENUM('user','admin')        | نوع الحساب               |
| `plan`          | ENUM('free','pro','agency') | الخطة الحالية            |
| `created_at`    | TIMESTAMP                   | تاريخ الإنشاء            |
| `updated_at`    | TIMESTAMP                   | آخر تعديل                |
| `is_active`     | BOOLEAN                     | حالة الحساب              |

🔗 **علاقات:**
`users` ⟶ `ads_generated`, `ai_reports`, `subscriptions`

---

### 2. جدول الإعلانات المستوردة (`ads_collected`)

| الحقل             | النوع                        | الوصف                               |
| ----------------- | ---------------------------- | ----------------------------------- |
| `id`              | UUID (PK)                    | معرف الإعلان                        |
| `platform`        | ENUM('instagram','facebook') | المنصة المصدر                       |
| `ad_url`          | TEXT                         | رابط الإعلان                        |
| `page_name`       | VARCHAR(255)                 | اسم الحساب المعلن                   |
| `category`        | VARCHAR(120)                 | فئة الإعلان (تجميل، ملابس...)       |
| `country`         | VARCHAR(80)                  | الدولة المستهدفة                    |
| `text_content`    | TEXT                         | النص المستخدم بالإعلان              |
| `media_url`       | TEXT                         | رابط الصورة أو الفيديو              |
| `likes`           | INTEGER                      | عدد الإعجابات                       |
| `comments`        | INTEGER                      | عدد التعليقات                       |
| `engagement_rate` | FLOAT                        | معدل التفاعل التقريبي               |
| `collected_at`    | TIMESTAMP                    | تاريخ الجلب                         |
| `ai_score`        | FLOAT                        | تقييم AdMirror Score (يُحدث لاحقًا) |

🔗 **علاقات:**
`ads_collected` ⟶ `ai_reports`

---

### 3. جدول التقارير التحليلية (`ai_reports`)

| الحقل               | النوع                        | الوصف                       |
| ------------------- | ---------------------------- | --------------------------- |
| `id`                | UUID (PK)                    | معرف التقرير                |
| `ad_id`             | UUID (FK → ads_collected.id) | الإعلان المحلل              |
| `user_id`           | UUID (FK → users.id)         | المستخدم الذي طلب التحليل   |
| `text_analysis`     | JSONB                        | تحليل النصوص                |
| `visual_analysis`   | JSONB                        | تحليل الصور والفيديوهات     |
| `audience_analysis` | JSONB                        | تحليل الجمهور               |
| `strategy_summary`  | TEXT                         | ملخص الاستراتيجية التسويقية |
| `adm_score`         | FLOAT                        | تقييم خوارزمية AdMirror     |
| `created_at`        | TIMESTAMP                    | وقت إنشاء التقرير           |

---

### 4. جدول الإعلانات المولدة (`ads_generated`)

| الحقل               | النوع                               | الوصف                         |
| ------------------- | ----------------------------------- | ----------------------------- |
| `id`                | UUID (PK)                           | معرف الإعلان الجديد           |
| `user_id`           | UUID (FK → users.id)                | صاحب الطلب                    |
| `source_ad_id`      | UUID (FK → ads_collected.id)        | الإعلان الأصلي المستوحى منه   |
| `generated_text`    | TEXT                                | النص الناتج                   |
| `hashtags`          | TEXT[]                              | قائمة الهاشتاغات              |
| `media_preview_url` | TEXT                                | رابط الصورة أو الفيديو الناتج |
| `generation_type`   | ENUM('text','image','video','full') | نوع التوليد                   |
| `created_at`        | TIMESTAMP                           | تاريخ الإنشاء                 |

---

### 5. جدول الاشتراكات (`subscriptions`)

| الحقل                | النوع                               | الوصف                  |
| -------------------- | ----------------------------------- | ---------------------- |
| `id`                 | UUID (PK)                           | معرف الاشتراك          |
| `user_id`            | UUID (FK → users.id)                | المستخدم               |
| `stripe_customer_id` | VARCHAR(120)                        | معرّف العميل في Stripe |
| `plan`               | ENUM('free','pro','agency')         | الخطة                  |
| `status`             | ENUM('active','canceled','expired') | حالة الاشتراك          |
| `renewal_date`       | TIMESTAMP                           | تاريخ التجديد          |
| `created_at`         | TIMESTAMP                           | تاريخ الاشتراك         |

---

### 6. جدول الإحصائيات العامة (`system_metrics`)

| الحقل                     | النوع       | الوصف                   |
| ------------------------- | ----------- | ----------------------- |
| `id`                      | SERIAL (PK) | المعرف                  |
| `total_users`             | INTEGER     | عدد المستخدمين الكلي    |
| `total_ads_collected`     | INTEGER     | عدد الإعلانات المستوردة |
| `total_reports_generated` | INTEGER     | عدد التقارير            |
| `total_ads_generated`     | INTEGER     | عدد الإعلانات الناتجة   |
| `last_update`             | TIMESTAMP   | آخر تحديث للنظام        |

---

### 7. الجداول الداعمة (Optional)

* **`audit_logs`** — لتتبع نشاط المستخدمين.
* **`api_keys`** — في حال السماح باستخدام API خارجي.
* **`cache_metadata`** — لإدارة الـ caching والـ rate limits.
