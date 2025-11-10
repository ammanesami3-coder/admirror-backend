export default function Navbar() {
  return (
    <header className="h-16 bg-white shadow-sm fixed left-64 top-0 right-0 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Admin</span>
        <img
          src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </header>
  );
}
