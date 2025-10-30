## 📘 AdMirror — API Endpoints Documentation

### 1. Overview

واجهة برمجة تطبيقات (API) خاصة بـ **AdMirror** تعمل على FastAPI.
جميع النقاط مؤمنة بـ **JWT Tokens** ويجب تمريرها عبر `Authorization: Bearer <token>`.

---

### 2. Authentication

| Method | Endpoint        | Description                | Auth | Response                        |
| ------ | --------------- | -------------------------- | ---- | ------------------------------- |
| `POST` | `/auth/signup`  | إنشاء حساب جديد            | ❌    | `user_id`, `email`              |
| `POST` | `/auth/login`   | تسجيل الدخول واسترجاع توكن | ❌    | `access_token`, `refresh_token` |
| `POST` | `/auth/refresh` | تحديث التوكن               | ✅    | `new_access_token`              |
| `GET`  | `/auth/me`      | معلومات المستخدم الحالي    | ✅    | `user profile`                  |

---

### 3. Ads Intelligence

| Method | Endpoint       | Description                                                  | Auth      | Response         |
| ------ | -------------- | ------------------------------------------------------------ | --------- | ---------------- |
| `GET`  | `/ads/search`  | بحث في مكتبة الإعلانات عبر الكلمات المفتاحية / الفئة / البلد | ✅         | قائمة إعلانات    |
| `GET`  | `/ads/{ad_id}` | تفاصيل إعلان معين                                            | ✅         | بيانات الإعلان   |
| `POST` | `/ads/fetch`   | جلب إعلانات جديدة من Meta API (للمشرف فقط)                   | 🛡️ Admin | حالة الجلب       |
| `GET`  | `/ads/stats`   | إحصائيات الإعلانات المخزنة                                   | 🛡️ Admin | JSON بالإحصائيات |

---

### 4. AI Analysis Suite

| Method | Endpoint             | Description                             | Auth | Response          |
| ------ | -------------------- | --------------------------------------- | ---- | ----------------- |
| `POST` | `/ai/analyze/text`   | تحليل نص إعلان واستخراج العوامل النفسية | ✅    | JSON تحليل        |
| `POST` | `/ai/analyze/media`  | تحليل صورة أو فيديو إعلان               | ✅    | JSON تحليل بصري   |
| `POST` | `/ai/analyze/full`   | تحليل شامل (نص + صورة + فيديو)          | ✅    | `AdMirror Report` |
| `GET`  | `/ai/report/{ad_id}` | تحميل التقرير التحليلي للإعلان          | ✅    | JSON أو PDF       |

---

### 5. Ad Generation Engine

| Method | Endpoint             | Description                           | Auth | Response      |
| ------ | -------------------- | ------------------------------------- | ---- | ------------- |
| `POST` | `/generate/ad`       | توليد إعلان جديد مستوحى من إعلان ناجح | ✅    | JSON أو ZIP   |
| `POST` | `/generate/hashtags` | توليد هاشتاغات واقتراحات نشر          | ✅    | قائمة نصوص    |
| `POST` | `/generate/video`    | توليد فيديو قصير باستخدام AI          | ✅    | رابط فيديو    |
| `GET`  | `/generate/history`  | عرض سجل الإعلانات المولدة للمستخدم    | ✅    | قائمة إعلانات |

---

### 6. User Management & Billing

| Method | Endpoint             | Description            | Auth | Response    |
| ------ | -------------------- | ---------------------- | ---- | ----------- |
| `GET`  | `/users/me`          | تفاصيل الحساب          | ✅    | JSON        |
| `PUT`  | `/users/me`          | تحديث الملف الشخصي     | ✅    | JSON        |
| `GET`  | `/billing/plans`     | عرض الخطط والأسعار     | ✅    | قائمة الخطط |
| `POST` | `/billing/subscribe` | الاشتراك في خطة معينة  | ✅    | حالة الدفع  |
| `POST` | `/billing/webhook`   | استقبال إشعارات Stripe | ❌    | HTTP 200    |

---

### 7. Admin Endpoints (Protected)

| Method | Endpoint         | Description                 | Auth      | Response    |
| ------ | ---------------- | --------------------------- | --------- | ----------- |
| `GET`  | `/admin/users`   | قائمة المستخدمين            | 🛡️ Admin | JSON        |
| `GET`  | `/admin/usage`   | إحصائيات الاستعمال والتحليل | 🛡️ Admin | JSON        |
| `GET`  | `/admin/reports` | تنزيل تقارير النظام         | 🛡️ Admin | CSV أو JSON |

---

### 8. Error Codes

| Code | Message               | Description               |
| ---- | --------------------- | ------------------------- |
| 400  | Bad Request           | بيانات ناقصة أو غير صحيحة |
| 401  | Unauthorized          | توكن مفقود أو غير صالح    |
| 403  | Forbidden             | صلاحيات غير كافية         |
| 404  | Not Found             | المسار غير موجود          |
| 429  | Rate Limit            | تجاوز الحد المسموح        |
| 500  | Internal Server Error | خطأ في الخادم             |

