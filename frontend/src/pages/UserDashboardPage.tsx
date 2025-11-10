import { useEffect, useState } from "react";
import api from "../lib/axios";
import { motion } from "framer-motion";
import { User, BarChart3, Clock, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserStats {
  email: string;
  full_name: string | null;
  joined: string | null;
  total_ads: number;
  role: string;
}

export default function UserDashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/users/stats");
        console.log("✅ STATS RESPONSE:", res.data);
        setStats(res.data);
      } catch (err: any) {
        console.error("❌ فشل في جلب بيانات المستخدم:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400 text-lg">
        جاري تحميل البيانات...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-400 text-lg">
        حدث خطأ أثناء تحميل البيانات.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <User className="w-10 h-10 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">
              {stats.full_name || "لوحة المستخدم"}
            </h1>
            <p className="text-gray-300 text-sm">{stats.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-5 bg-white/10 rounded-xl border border-white/20 text-center"
          >
            <Clock className="w-6 h-6 mx-auto mb-2 text-indigo-300" />
            <p className="text-gray-400 text-sm">تاريخ الانضمام</p>
            <h2 className="text-lg font-semibold">
              {stats.joined ? new Date(stats.joined).toLocaleDateString("ar-MA") : "—"}
            </h2>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-5 bg-white/10 rounded-xl border border-white/20 text-center"
          >
            <Megaphone className="w-6 h-6 mx-auto mb-2 text-indigo-300" />
            <p className="text-gray-400 text-sm">عدد الإعلانات المنشأة</p>
            <h2 className="text-lg font-semibold">{stats.total_ads}</h2>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-5 bg-white/10 rounded-xl border border-white/20 text-center"
          >
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-indigo-300" />
            <p className="text-gray-400 text-sm">الدور</p>
            <h2 className="text-lg font-semibold capitalize">{stats.role}</h2>
          </motion.div>
        </div>

        {/* Buttons */}
        <div className="text-center mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/user-dashboard/generate")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition"
          >
            ✨ إنشاء إعلان جديد
          </button>

          <button
            onClick={() => navigate("/user-dashboard/ads")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 rounded-xl font-semibold transition"
          >
            📜 إعلاناتي
          </button>
        </div>
      </motion.div>
    </div>
  );
}
