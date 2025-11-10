import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/pages/Dashboard";
import AllAdsPage from "@/pages/AllAdsPage";
import AdsLibraryPage from "@/pages/AdsLibrary";
import GenerateAdPage from "@/pages/GenerateAdPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import UsersPage from "@/pages/UsersPage";
import LoginPage from "@/pages/LoginPage";
import UserDashboardPage from "@/pages/UserDashboardPage";
import UserGenerateAdPage from "@/pages/UserGenerateAdPage";
import UserAdsPage from "./pages/UserAdsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* صفحة تسجيل الدخول المستقلة */}
        <Route path="/login" element={<LoginPage />} />

        {/* لوحة تحكم المشرف (تحتوي على الشريط الجانبي) */}
        <Route
          path="/dashboard/*"
          element={
            <div className="flex h-screen bg-gray-50 text-gray-900">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route index element={<DashboardPage />} />
                  <Route path="all-ads" element={<AllAdsPage />} />
                  <Route path="ads-library" element={<AdsLibraryPage />} />
                  <Route path="generate-ad" element={<GenerateAdPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="/user-dashboard/ads" element={<UserAdsPage />} />
                </Routes>
              </main>
            </div>
          }
        />

        {/* لوحة تحكم المستخدم (بدون الشريط الجانبي) */}
        <Route path="/user-dashboard" element={<UserDashboardPage />} />
        <Route path="/user-dashboard/generate" element={<UserGenerateAdPage />} />

        {/* تحويل أي رابط غير معروف إلى صفحة تسجيل الدخول */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
