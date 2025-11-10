import api from "./axiosInstance"; // ✅ بدلاً من axios المباشر

// قاعدة الـ API العامة
const API_BASE = "http://127.0.0.1:8000";

// جلب أحدث إعلان مولَّد
export async function getLatestGeneratedAd() {
  const res = await api.get(`${API_BASE}/ads-library/latest`);
  return res.data;
}
