import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/users/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, role } = res.data;

      if (!access_token) {
        setError("لم يتم استلام التوكن من الخادم");
        return;
      }

      // ✅ حفظ بيانات الجلسة
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      // ✅ توجيه المستخدم حسب الدور
      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err?.response?.data?.detail || "فشل تسجيل الدخول");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-8">تسجيل الدخول</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            className="p-3 rounded-md text-gray-800 w-full"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="p-3 rounded-md text-gray-800 w-full"
            required
          />

          {error && <p className="text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-semibold transition"
          >
            تسجيل الدخول
          </button>
        </form>
      </motion.div>
    </div>
  );
}
