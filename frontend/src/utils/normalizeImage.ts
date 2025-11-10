const BASE_URL = "http://127.0.0.1:8000";

export function normalizeImage(raw?: string | null): string {
  if (!raw) return "";
  const url = raw.trim();
  if (!url) return "";

  // حالة 1: الصورة داخل static
  if (url.startsWith("/")) return `${BASE_URL}${url}`;

  // حالة 2: المسار من نوع file://C:\Users\...
  if (url.toLowerCase().startsWith("file://")) {
    const fileName = url.split("\\").pop() || url.split("/").pop() || "";
    return `${BASE_URL}/static/generated/${fileName}`;
  }

  // حالة 3: رابط جاهز
  return url;
}
