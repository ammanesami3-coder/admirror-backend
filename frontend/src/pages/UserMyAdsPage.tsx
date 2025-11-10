import { useEffect, useState } from "react";
import api from "../lib/axios";
import { motion } from "framer-motion";
import { Image, Loader2, Calendar } from "lucide-react";

interface Ad {
  id: string;
  text: string;
  image_url: string;
  score?: number;
  created_at?: string;
}

export default function UserMyAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get("/users/my-ads");
        setAds(res.data);
      } catch (err) {
        console.error("❌ فشل في جلب الإعلانات:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-400 w-8 h-8" />
      </div>
    );

  if (ads.length === 0)
    return (
      <div className="text-center text-gray-400 mt-20">
        لم تقم بإنشاء أي إعلان بعد.
      </div>
    );

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">📢 إعلاناتي</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad, i) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={
                ad.image_url?.startsWith("http")
                  ? ad.image_url
                  : `http://127.0.0.1:8000${ad.image_url}`
              }
              alt="Ad"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-gray-200 mb-3 line-clamp-3">{ad.text}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {ad.created_at
                    ? new Date(ad.created_at).toLocaleDateString("ar-MA")
                    : "—"}
                </span>
                {ad.score && <span>⭐ {ad.score}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
