import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import api from "@/api/axiosInstance";

interface Ad {
  id: string;
  text: string;
  image_url: string;
  score: number;
  created_at: string;
}

export default function AdsLibrary() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب الإعلانات من الـ API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get("/ads-library/all");
        setAds(res.data || []);
      } catch (err) {
        console.error("❌ فشل في جلب الإعلانات:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا الإعلان؟")) return;
    try {
      await api.delete(`/ads-library/delete/${id}`);
      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } catch (err) {
      console.error("❌ فشل في حذف الإعلان:", err);
      alert("حدث خطأ أثناء حذف الإعلان");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        ⏳ جاري تحميل المكتبة الإعلانية...
      </div>
    );

  if (!ads.length)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        لا توجد إعلانات في المكتبة.
      </div>
    );

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-center mb-10">📚 Ads Library</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {ads.map((ad, index) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transition"
          >
            <img
              src={
                ad.image_url?.startsWith("/static")
                  ? `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}${ad.image_url}`
                  : ad.image_url
              }
              alt="ad"
              className="w-full h-64 object-cover"
              onError={(e) => ((e.currentTarget.src = "/static/placeholder.png"))}
            />
            <div className="p-4">
              <p className="text-sm text-gray-200 line-clamp-3">{ad.text}</p>
              <p className="text-indigo-400 font-semibold mt-2">
                ⭐ Score: {ad.score}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                📅 {new Date(ad.created_at).toLocaleString("ar-MA")}
              </p>
            </div>

            {/* زر الحذف */}
            <button
              onClick={() => handleDelete(ad.id)}
              className="absolute top-3 right-3 p-2 bg-red-500/70 hover:bg-red-600 rounded-full transition"
              title="حذف الإعلان"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
