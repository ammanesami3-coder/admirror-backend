import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between"
    >
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-semibold text-indigo-600 mt-2">{value}</p>
      </div>
      <div className="text-indigo-500">{icon}</div>
    </motion.div>
  );
}
