import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/api/axiosInstance";
import AdPostCard from "../components/AdPostCard";
import { normalizeImage } from "../utils/normalizeImage";

interface Ad {
  id: string;
  text: string;
  image_url: string | null;
  score: number;
}

export default function AllAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ======== دالة حذف الإعلان ========
  async function handleDelete(adId: string) {
    const confirmed = confirm("هل أنت متأكد أنك تريد حذف هذا الإعلان؟");
    if (!confirmed) return;

    try {
      await api.delete(`/ads-library/delete/${adId}`);
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    } catch (err) {
      console.error("❌ فشل في حذف الإعلان:", err);
      alert("حدث خطأ أثناء الحذف");
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        ⏳ جاري تحميل الإعلانات...
      </div>
    );

  if (!ads || ads.length === 0)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        لا توجد إعلانات بعد.
      </div>
    );

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-gray-50 min-h-screen">
      {ads.map((ad, index) => (
        <motion.div
          key={ad.id || index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative group"
        >
          <AdPostCard
            image={normalizeImage(ad.image_url)}
            text={`${ad.text}\n\nScore: ${ad.score}`}
            platform="instagram"
          />

          {/* زر الحذف */}
          <button
            onClick={() => handleDelete(ad.id)}
            className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow hover:bg-red-700 opacity-0 group-hover:opacity-100 transition"
          >
            🗑 حذف
          </button>
        </motion.div>
      ))}
    </div>
  );
}
