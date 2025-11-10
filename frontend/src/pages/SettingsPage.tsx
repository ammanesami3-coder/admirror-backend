import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Key, Cpu, Image } from "lucide-react";

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [imageSize, setImageSize] = useState("1024x1024");
  const [saved, setSaved] = useState(false);

  // تحميل الإعدادات من التخزين المحلي
  useEffect(() => {
    const savedSettings = localStorage.getItem("adm_settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setOpenaiKey(parsed.openaiKey || "");
      setModel(parsed.model || "gpt-4o-mini");
      setImageSize(parsed.imageSize || "1024x1024");
    }
  }, []);

  // حفظ الإعدادات
  const handleSave = () => {
    localStorage.setItem(
      "adm_settings",
      JSON.stringify({ openaiKey, model, imageSize })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 min-h-screen text-white flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-8">⚙️ System Settings</h1>

        <div className="space-y-6">
          {/* OpenAI API Key */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Key size={16} className="text-indigo-400" />
              OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-********************************"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Model */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Cpu size={16} className="text-indigo-400" />
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="gpt-4o">GPT-4o (High Quality)</option>
              <option value="gpt-4o-mini">GPT-4o-mini (Fast & Economical)</option>
              <option value="gpt-4-turbo">GPT-4-Turbo</option>
            </select>
          </div>

          {/* Image Size */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Image size={16} className="text-indigo-400" />
              Image Size
            </label>
            <select
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="512x512">512 × 512</option>
              <option value="768x768">768 × 768</option>
              <option value="1024x1024">1024 × 1024</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 rounded-xl shadow-lg"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>

        {saved && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-green-400 mt-4"
          >
            ✅ Settings saved successfully!
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
