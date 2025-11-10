import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  FolderOpen,
  Wand2,
  BarChart3,
  Settings,
  ImageIcon,
  Save,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("button[aria-label='Toggle sidebar']")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // قائمة الروابط الجانبية
  const links = [
    { to: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/dashboard/all-ads", icon: <ImageIcon size={18} />, label: "All Ads" },
    { to: "/dashboard/ads-library", icon: <FolderOpen size={18} />, label: "Ads Library" },
    { to: "/dashboard/generate-ad", icon: <Wand2 size={18} />, label: "Generate Ad" },
    { to: "/dashboard/analytics", icon: <BarChart3 size={18} />, label: "Analytics" },
    { to: "/dashboard/settings", icon: <Settings size={18} />, label: "Settings" },
    // داخل المصفوفة links
{ to: "/dashboard/users", icon: <Save size={18} />, label: "Users" },

  ];

  return (
    <>
      {/* زر إظهار/إخفاء القائمة */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-full shadow-md hover:bg-gray-800 transition"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* القائمة الجانبية */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 shadow-xl flex flex-col z-40 backdrop-blur-lg border-r border-gray-800"
          >
            {/* الشعار */}
            <div className="flex items-center justify-center py-6 border-b border-gray-700">
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 select-none">
                AdMirror
              </span>
            </div>

            {/* روابط التنقل */}
            <nav className="flex flex-col mt-4 space-y-2 px-4">
              {links.map(({ to, icon, label }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                      active
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {icon}
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* تذييل بسيط */}
            <div className="mt-auto mb-6 px-4 text-xs text-gray-500 text-center">
              © 2025 AdMirror
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* إزاحة لتفادي التداخل مع المحتوى */}
      <div className="ml-16 sm:ml-20"></div>
    </>
  );
}
