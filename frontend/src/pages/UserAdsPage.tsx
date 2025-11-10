import { useEffect, useState } from "react";
import api from "../lib/axios";
import { motion } from "framer-motion";
import { Loader2, Megaphone } from "lucide-react";

interface UserAd {
  id: string;
  ad_text: string;
  design_url: string;
  created_at: string;
  score?: number;
}

export default function UserAdsPage() {
  const [ads, setAds] = useState<UserAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/ads-library/user");
        console.log("✅ Ads fetched:", res.data);
        setAds(res.data);
      } catch (err: any) {
        console.error("❌ Failed to fetch ads:", err);
        setError(err.response?.data?.detail || "حدث خطأ أثناء جلب الإعلانات.");
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        <Loader2 className="animate-spin mr-2" /> جاري تحميل الإعلانات...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-400 mt-24 text-lg">{error}</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Megaphone className="text-indigo-400" />
          إعلاناتي
        </h1>

        {ads.length === 0 ? (
          <div className="text-center text-gray-300 mt-24">
            لا توجد إعلانات بعد ✨
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    ad.design_url?.startsWith("http")
                      ? ad.design_url
                      : `http://127.0.0.1:8000${ad.design_url}`
                  }
                  alt="Ad"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-200 mb-2">{ad.ad_text}</p>
                  <p className="text-xs text-gray-400">
                    📅 {new Date(ad.created_at).toLocaleDateString("ar-MA")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
