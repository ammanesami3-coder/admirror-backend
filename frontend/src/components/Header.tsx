export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm px-6 py-3 flex justify-between items-center border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
        Dashboard Overview
      </h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Admin</span>
        <img
          src="https://ui-avatars.com/api/?name=Admin"
          alt="Admin Avatar"
          className="w-8 h-8 rounded-full border border-gray-300"
        />
      </div>
    </header>
  );
}
