import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ تمت إضافته هنا
import api from "@/api/axiosInstance"; // axios المهيأ بالتوكن
import AdPostCard from "../components/AdPostCard";
import { Card, CardContent } from "../components/ui/card";
import { TrendingUp, BarChart3, Sparkles, PlusCircle } from "lucide-react";

interface Stats {
  total_ads: number;
  analyzed_ads: number;
  generated_ads: number;
}

interface LatestAd {
  text: string;
  image: string;
  score: number;
  ad_id: string;
  platform?: "instagram" | "facebook";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_ads: 0,
    analyzed_ads: 0,
    generated_ads: 0,
  });

  const [latestAd, setLatestAd] = useState<LatestAd | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ هو المسؤول عن التوجيه السلس

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, latestRes] = await Promise.all([
          api.get("/ads-library/stats"),
          api.get("/ads-library/latest"),
        ]);
        setStats(statsRes.data);
        setLatestAd(latestRes.data);
      } catch (err: any) {
        console.error("❌ فشل في جلب بيانات لوحة التحكم:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const platform =
    latestAd?.image?.toLowerCase().includes("facebook") ||
    latestAd?.text?.toLowerCase().includes("facebook")
      ? "facebook"
      : "instagram";

  return (
    <div className="p-6 flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <button
          onClick={() => navigate("/dashboard/generate-ad")} // ✅ انتقال سلس بدون إعادة تحميل
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          <PlusCircle size={18} />
          <span>Create New Ad</span>
        </button>
      </div>

      {/* Stats Section */}
      {loading ? (
        <p className="text-gray-500 text-center mt-10">جاري تحميل البيانات...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Total Ads", value: stats.total_ads, icon: BarChart3 },
            { title: "Analyzed Ads", value: stats.analyzed_ads, icon: TrendingUp },
            { title: "Generated Ads", value: stats.generated_ads, icon: Sparkles },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-2xl shadow-md hover:shadow-lg transition bg-white">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <s.icon className="text-indigo-500 w-8 h-8 mb-3" />
                  <p className="text-sm text-gray-500">{s.title}</p>
                  <h3 className="text-2xl font-semibold">{s.value}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Latest Ad */}
      {latestAd ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center w-full"
        >
          <AdPostCard
            image={
              latestAd.image.startsWith("http")
                ? latestAd.image
                : `http://127.0.0.1:8000${latestAd.image}`
            }
            text={`${latestAd.text || ""}\n\n⭐ Score: ${latestAd.score}`}
            platform={platform}
          />
        </motion.div>
      ) : (
        !loading && (
          <p className="text-gray-500 text-center mt-6">
            لا يوجد إعلان منشور بعد.
          </p>
        )
      )}
    </div>
  );
}
