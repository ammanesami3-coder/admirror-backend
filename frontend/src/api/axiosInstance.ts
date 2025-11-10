import axios from "axios";

// إنشاء نسخة axios عامة
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ إضافة التوكن تلقائيًا لكل الطلبات إذا كان موجودًا
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ في حالة انتهاء صلاحية التوكن أو رفض المصادقة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // حذف التوكن وإعادة توجيه المستخدم لصفحة تسجيل الدخول
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
