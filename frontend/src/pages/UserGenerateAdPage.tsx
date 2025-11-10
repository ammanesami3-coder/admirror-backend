import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/api/axiosInstance"; // ✅ استخدام axios المهيأ بالتوكن

export default function GenerateAdPage() {
  const [platform, setPlatform] = useState("instagram");
  const [adText, setAdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text?: string; image_url?: string; score?: number } | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!adText.trim()) {
      setError("الرجاء إدخال نص الإعلان أولاً.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/ads-library/generate-enhanced", {
        text: adText,
        platform,
      });
      setResult(res.data);
    } catch (err: any) {
      console.error("❌ فشل في توليد الإعلان:", err);
      setError(err?.response?.data?.detail || "حدث خطأ غير متوقع أثناء التوليد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.2)] rounded-3xl p-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            🪄 توليد إعلان احترافي
          </h1>
          <p className="text-indigo-200 text-sm">
            استخدم الذكاء الاصطناعي لإنشاء نصوص وصور إعلانية جاهزة للنشر.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-indigo-100 font-medium mb-2">نص الإعلان</label>
              <textarea
                value={adText}
                onChange={(e) => setAdText(e.target.value)}
                rows={5}
                placeholder="اكتب وصفًا لمنتجك أو العرض أو الحملة..."
                className="w-full rounded-2xl p-4 bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-indigo-100 font-medium mb-2">المنصة</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl p-3 bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            {error && (
              <p className="text-red-300 text-sm bg-red-900/40 border border-red-700/50 p-2 rounded-lg">
                {error}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl text-base font-semibold tracking-wide transition-all duration-200 ${
                loading
                  ? "bg-gray-500/60 cursor-not-allowed text-gray-300"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-indigo-500/30"
              }`}
            >
              {loading ? "⏳ جاري التوليد..." : "✨ توليد الإعلان"}
            </motion.button>
          </div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-md shadow-inner flex flex-col items-center justify-center min-h-[400px]"
          >
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
              >
                <div className="flex items-center px-4 py-3">
                  <img className="h-10 w-10 rounded-full border" src="/static/insta-avatar.png" alt="avatar" />
                  <div className="ml-3">
                    <p className="text-gray-900 font-semibold text-sm">AdMirror AI</p>
                    <p className="text-gray-400 text-xs">@adm_ai</p>
                  </div>
                </div>

                {result.image_url && (
                  <img
                    src={result.image_url.startsWith("http") ? result.image_url : `http://127.0.0.1:8000${result.image_url}`}
                    alt="Ad visual"
                    className="w-full h-80 object-cover"
                  />
                )}

                <div className="p-4">
                  <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{result.text}</p>
                  <div className="mt-3 flex items-center justify-between text-gray-500 text-sm">
                    <p>❤️ 1,248</p>
                    <p>💬 93</p>
                    <p>📤 Share</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <p className="text-indigo-200 text-sm">أدخل نصًا لتوليد إعلان جديد.</p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
