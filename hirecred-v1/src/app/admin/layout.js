"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Search,
  LogOut,
  Menu,
  X,
  Shield,
  Bot,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Applicants", href: "/admin/applicants", icon: Users },
  { label: "Smart Search", href: "/admin/search", icon: Search },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your HireCred AI Assistant. Ask me anything about applicants, scores, or hiring decisions.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

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

  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = { role: "user", text: aiInput };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: aiInput,
          history: aiMessages,
        }),
      });

      const data = await res.json();

      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "Sorry, I could not process that.",
        },
      ]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
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
          <Link href="/admin/dashboard">
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

        {/* Admin Info */}
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {user?.name || "Admin"}
              </p>
              <p className="text-brand-400 text-xs flex items-center gap-1">
                <Shield size={10} />
                Admin
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-3 py-4">
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

        {/* AI Assistant Button */}
        <div className="px-3 py-2">
          <button
            onClick={() => setAiOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 border border-brand-500/30 transition"
          >
            <Bot size={18} />
            AI Assistant
            <span className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </button>
        </div>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-dark-600 mt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-dark-700 hover:text-red-400 transition w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay */}
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
              Admin Panel —{" "}
              <span className="text-white font-medium">
                {user?.name || "Admin"}
              </span>
            </p>
          </div>
          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-2 bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 px-4 py-2 rounded-lg text-sm transition"
          >
            <Bot size={16} />
            AI Assistant
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {/* AI Assistant Panel */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end p-4 md:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAiOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full md:w-96 h-[580px] bg-dark-800 border border-dark-600 rounded-2xl flex flex-col shadow-2xl">

            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-600/20 rounded-lg flex items-center justify-center">
                  <Bot size={18} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    AI Assistant
                  </p>
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-brand-600/20 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Bot size={14} className="text-brand-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-600 text-white rounded-br-sm"
                        : "bg-dark-700 text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 bg-brand-600/20 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot size={14} className="text-brand-400" />
                  </div>
                  <div className="bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            {aiMessages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {[
                  "Show top candidates",
                  "Who has highest score?",
                  "Any fraud risks?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setAiInput(prompt);
                    }}
                    className="text-xs bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 border border-dark-500 px-3 py-1.5 rounded-full transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-4 border-t border-dark-600 flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
                placeholder="Ask about any applicant..."
                className="flex-1 bg-dark-700 border border-dark-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
              />
              <button
                onClick={sendAiMessage}
                disabled={aiLoading || !aiInput.trim()}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}