import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/api/axiosInstance";
import { BarChart3 } from "lucide-react";

interface AdResult {
  ad_id: string;
  text: string;
  image_url: string | null;
  score: number;
  text_analysis?: { analysis: string };
  image_analysis?: { visual_analysis: string };
  created_at: string;
}

export default function AnalyticsPage() {
  const [results, setResults] = useState<AdResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/ads-library/analytics/all");
        setResults(res.data || []);
      } catch (err) {
        console.error("❌ فشل في جلب التحليلات:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        ⏳ جاري تحميل التحليلات...
      </div>
    );

  if (!results.length)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        لا توجد تحليلات حالياً.
      </div>
    );

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 min-h-screen text-white">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold text-center mb-10"
      >
        📈 Ad Performance Analytics
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((ad, i) => (
          <motion.div
            key={ad.ad_id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-lg hover:scale-[1.02] transition"
          >
            {ad.image_url && (
              <img
                src={
                  ad.image_url.startsWith("http")
                    ? ad.image_url
                    : `http://127.0.0.1:8000${ad.image_url}`
                }
                alt="Ad"
                className="rounded-xl mb-4 w-full h-48 object-cover"
              />
            )}

            <h2 className="font-semibold text-lg mb-2 line-clamp-2">{ad.text}</h2>

            <div className="flex items-center gap-2 text-indigo-400 mb-3">
              <BarChart3 size={18} />
              <span>Score: {ad.score}</span>
            </div>

            <p className="text-sm text-gray-300 line-clamp-4 mb-2">
              {ad.text_analysis?.analysis || "— لا يوجد تحليل نصي —"}
            </p>

            {ad.image_analysis?.visual_analysis && (
              <p className="text-xs text-gray-400 mb-2 line-clamp-3">
                {ad.image_analysis.visual_analysis}
              </p>
            )}

            <p className="text-xs text-gray-400">
              {new Date(ad.created_at).toLocaleString("ar-MA")}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
