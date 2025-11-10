import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import { motion } from "framer-motion";
import { UserPlus, Search, ShieldCheck, User, Loader2, X } from "lucide-react";

type Role = "user" | "admin";

interface UserRow {
  id: string;
  email: string;
  full_name?: string | null;
  role: Role;
  is_active: boolean;
  created_at?: string | null;
}

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user" as Role,
  });

  // جلب المستخدمين
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/all");
      setRows(res.data || []);
    } catch (e) {
      console.error("❌ Failed to fetch users", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // إنشاء مستخدم جديد
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users/create", {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      // تحديث القائمة
      await fetchUsers();

      // إعادة تعيين النموذج وإغلاق المودال
      setShowForm(false);
      setForm({ full_name: "", email: "", password: "", role: "user" });

      alert("✅ تم إضافة المستخدم بنجاح");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "فشل إنشاء المستخدم");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
const handleDelete = async (userId: string) => {
  if (!confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم؟")) return;
  try {
    await api.delete(`/users/${userId}`);
    setRows((prev) => prev.filter((u) => u.id !== userId)); // تحديث الجدول
  } catch (err: any) {
    alert(err?.response?.data?.detail || "فشل حذف المستخدم");
  }
};

  // الفلترة
  const filtered = useMemo(() => {
    return rows.filter((u) => {
      const text = `${u.email} ${u.full_name || ""}`.toLowerCase();
      const okQ = text.includes(q.toLowerCase());
      const okRole = roleFilter === "all" ? true : u.role === roleFilter;
      return okQ && okRole;
    });
  }, [rows, q, roleFilter]);

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">👥 Users Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-lg"
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث بالبريد أو الاسم..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-indigo-400 outline-none text-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">كل الأدوار</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-300" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-300">لا يوجد نتائج</div>
        ) : (
          <div className="overflow-x-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/10 text-gray-300 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-3">الاسم</th>
                  <th className="px-6 py-3">البريد</th>
                  <th className="px-6 py-3">الدور</th>
                  <th className="px-6 py-3">الحالة</th>
                  <th className="px-6 py-3">التاريخ</th>
                  <th className="px-6 py-3 text-right">حذف</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/10 hover:bg-white/10 transition"
                  >
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User size={16} className="text-indigo-300" />
                      {u.full_name || "—"}
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-indigo-300">
                          <ShieldCheck size={14} /> Admin
                        </span>
                      ) : (
                        "User"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          u.is_active
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {u.is_active ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("ar-MA")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
  <button
    onClick={() => handleDelete(u.id)}
    className="text-red-400 hover:text-red-600 transition"
  >
    🗑️
  </button>
</td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Modal for Adding User */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 text-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-white/20 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">➕ مستخدم جديد</h2>
            <form onSubmit={createUser} className="space-y-3">
              <input
                className="w-full bg-slate-700 p-2 rounded-lg border border-gray-600"
                placeholder="الاسم الكامل"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
              <input
                type="email"
                className="w-full bg-slate-700 p-2 rounded-lg border border-gray-600"
                placeholder="البريد الإلكتروني"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                className="w-full bg-slate-700 p-2 rounded-lg border border-gray-600"
                placeholder="كلمة المرور"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <select
                className="w-full bg-slate-700 p-2 rounded-lg border border-gray-600"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Role })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

