"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Upload,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/user/profile", icon: User },
  { label: "Upload Resume", href: "/user/upload", icon: Upload },
  { label: "Messages", href: "/user/messages", icon: MessageSquare },
];

export default function UserLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("hirecred_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("hirecred_user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-600 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-600">
          <Link href="/user/dashboard">
            <h1 className="text-2xl font-bold text-white">
              Hire<span className="text-brand-500">Cred</span>
            </h1>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {user?.name || "User"}
              </p>
              <p className="text-gray-500 text-xs">Candidate</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-3 py-4 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-400 hover:bg-dark-700 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-dark-600">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-dark-700 hover:text-red-400 transition w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navbar */}
        <header className="bg-dark-800 border-b border-dark-600 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <p className="text-gray-400 text-sm">
              Welcome back,{" "}
              <span className="text-white font-medium">
                {user?.name || "User"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-dark-700 px-3 py-1.5 rounded-full">
            <Shield size={12} className="text-brand-400" />
            Candidate Account
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}