"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    // ✅ ADD THIS - Save user data to localStorage
    localStorage.setItem("hirecred_user", JSON.stringify(data.user));

    // Redirect based on role
    if (data.user.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  } catch (err) {
    setError("Something went wrong. Please try again.");
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Hire<span className="text-brand-500">Cred</span>
          </h1>
          <p className="text-gray-400 mt-2">Trust-based hiring platform</p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Welcome back
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-dark-700 border border-dark-500 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-dark-700 border border-dark-500 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg px-4 py-3 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-brand-400 hover:text-brand-300 transition"
            >
              Register
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}