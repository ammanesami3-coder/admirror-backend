import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type LatestAd = {
  text?: string;
  image?: string;
  score?: number | string | null;
  ad_id?: string;
};

const API_URL = "http://127.0.0.1:8000"; // يمكنك تعديله لاحقًا إذا استعملت .env

export default function AdsGallery() {
  const [ads, setAds] = useState<LatestAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get<LatestAd>(`${API_URL}/ads-library/latest`);
        setAds(res.data ? [res.data] : []);
      } catch (err) {
        console.error("❌ فشل في جلب الإعلانات:", err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const formatScore = (v: LatestAd["score"]) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n.toFixed(1) : "N/A";
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">📸 Ads Gallery</h1>

      {ads.length === 0 ? (
        <div className="text-gray-300 text-center">لا توجد إعلانات بعد.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ads.map((ad, i) => {
            // معالجة الصورة لتعمل مع file:// أو /static
            let src: string;
            if (!ad.image) {
              src = "https://via.placeholder.com/600x800?text=Ad";
            } else if (ad.image.startsWith("file://")) {
              const filename = ad.image.split("\\").pop() || ad.image.split("/").pop();
              src = `${API_URL}/static/generated/${filename}`;
            } else if (ad.image.startsWith("/static")) {
              src = `${API_URL}${ad.image}`;
            } else {
              src = ad.image;
            }

            return (
              <motion.div
                key={ad.ad_id ?? i}
                className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <img
                  src={src}
                  alt="Ad"
                  className="w-full h-80 object-cover rounded-t-2xl"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-200 line-clamp-3">
                    {ad.text ?? "—"}
                  </p>
                  <p className="text-indigo-400 font-semibold mt-2">
                    ⭐ Score: {formatScore(ad.score)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
