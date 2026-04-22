"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Award,
  TrendingUp,
  Clock,
  Eye,
  Star,
  ChevronRight,
  Activity,
} from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    avgCredScore: 0,
    activeToday: 0,
    pendingReviews: 0,
  });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [topApplicants, setTopApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("hirecred_user");
    if (userData) {
      setUser(JSON.parse(userData));
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all applicants
      const res = await fetch("/api/admin/applicants");
      const data = await res.json();
      if (res.ok) {
        const applicants = data.applicants || [];
        
        // Calculate stats
        const total = applicants.length;
        const avgScore = applicants.reduce((sum, app) => sum + (app.credScore?.score || 0), 0) / (total || 1);
        const activeToday = applicants.filter(app => {
          const lastActive = new Date(app.lastActive || app.updatedAt);
          const today = new Date();
          return lastActive.toDateString() === today.toDateString();
        }).length;
        const pending = applicants.filter(app => !app.reviewed).length;

        setStats({
          totalApplicants: total,
          avgCredScore: Math.round(avgScore),
          activeToday,
          pendingReviews: pending,
        });

        // Recent applicants (last 5)
        setRecentApplicants(applicants.slice(0, 5));

        // Top applicants by score
        const sorted = [...applicants].sort((a, b) => (b.credScore?.score || 0) - (a.credScore?.score || 0));
        setTopApplicants(sorted.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Applicants",
      value: stats.totalApplicants,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Avg HireCred Score",
      value: stats.avgCredScore,
      suffix: "/100",
      icon: Award,
      color: "text-brand-400",
      bg: "bg-brand-400/10",
    },
    {
      label: "Active Today",
      value: stats.activeToday,
      icon: Activity,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Pending Review",
      value: stats.pendingReviews,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back, {user?.name || "Admin"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-dark-800 border border-dark-600 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">
                {stat.value}
                {stat.suffix && (
                  <span className="text-sm text-gray-500 font-normal ml-1">
                    {stat.suffix}
                  </span>
                )}
              </p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Top Applicants & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Applicants */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl">
          <div className="px-5 py-4 border-b border-dark-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              <h2 className="text-white font-semibold">Top Candidates</h2>
            </div>
            <Link
              href="/admin/leaderboard"
              className="text-brand-400 text-sm hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-dark-600">
            {topApplicants.length === 0 ? (
              <p className="text-gray-500 text-sm p-5 text-center">
                No applicants yet
              </p>
            ) : (
              topApplicants.map((applicant, i) => (
                <div
                  key={applicant._id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-dark-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {applicant.name}
                      </p>
                      <p className="text-gray-500 text-xs">{applicant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">
                        {applicant.credScore?.score || 0}
                      </p>
                      <p className="text-gray-500 text-xs">HireCred</p>
                    </div>
                    <Link
                      href={`/admin/applicants/${applicant._id}`}
                      className="text-gray-500 hover:text-brand-400 transition"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl">
          <div className="px-5 py-4 border-b border-dark-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-brand-400" />
              <h2 className="text-white font-semibold">Recent Applicants</h2>
            </div>
            <Link
              href="/admin/applicants"
              className="text-brand-400 text-sm hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-dark-600">
            {recentApplicants.length === 0 ? (
              <p className="text-gray-500 text-sm p-5 text-center">
                No applicants yet
              </p>
            ) : (
              recentApplicants.map((applicant) => (
                <div
                  key={applicant._id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-dark-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-white font-semibold text-sm">
                      {applicant.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {applicant.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(applicant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400" />
                      <span className="text-white text-sm">
                        {applicant.ratings?.skill
                          ? ((applicant.ratings.skill +
                              applicant.ratings.communication +
                              applicant.ratings.reliability) /
                              3
                            ).toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                    <Link
                      href={`/admin/applicants/${applicant._id}`}
                      className="text-gray-500 hover:text-brand-400 transition"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/applicants"
            className="bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-xl p-4 text-center transition group"
          >
            <Users size={24} className="mx-auto mb-2 text-brand-400" />
            <p className="text-white text-sm font-medium">Browse All</p>
            <p className="text-gray-500 text-xs mt-1">View all candidates</p>
          </Link>
          <Link
            href="/admin/search"
            className="bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-xl p-4 text-center transition group"
          >
            <TrendingUp size={24} className="mx-auto mb-2 text-brand-400" />
            <p className="text-white text-sm font-medium">Smart Search</p>
            <p className="text-gray-500 text-xs mt-1">AI-powered search</p>
          </Link>
          <Link
            href="/admin/leaderboard"
            className="bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-xl p-4 text-center transition group"
          >
            <Award size={24} className="mx-auto mb-2 text-brand-400" />
            <p className="text-white text-sm font-medium">Leaderboard</p>
            <p className="text-gray-500 text-xs mt-1">Rank candidates</p>
          </Link>
        </div>
      </div>

    </div>
  );
}