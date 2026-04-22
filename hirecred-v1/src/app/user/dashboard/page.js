"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  FolderOpen,
  Star,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Upload,
} from "lucide-react";

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("hirecred_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchProfile(parsed.id);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/profile`);
      const data = await res.json();
      if (res.ok) setProfile(data.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateScore = async () => {
    try {
      const res = await fetch("/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((prev) => ({ ...prev, credScore: data.credScore }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completionItems = [
    { label: "Bio added", done: profile?.bio?.length > 0 },
    { label: "Skills added", done: profile?.skills?.length > 0 },
    { label: "Experience added", done: profile?.experience?.length > 0 },
    { label: "Portfolio added", done: profile?.portfolio?.length > 0 },
    { label: "Resume uploaded", done: profile?.resumeUrl?.length > 0 },
    { label: "GitHub linked", done: profile?.proofSignals?.githubUrl?.length > 0 },
  ];

  const completionPercent = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          My Dashboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Track your credibility and profile strength
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* HireCred Score */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 col-span-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">HireCred Score</p>
            <Award className="text-brand-400" size={20} />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-white">
              {profile?.credScore?.score || 0}
            </span>
            <span className="text-gray-500 mb-1">/100</span>
          </div>
          {/* Score bar */}
          <div className="mt-4 h-2 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
              style={{ width: `${profile?.credScore?.score || 0}%` }}
            />
          </div>
          <button
            onClick={generateScore}
            className="mt-4 w-full text-xs text-brand-400 hover:text-brand-300 border border-brand-500/30 hover:border-brand-500 rounded-lg py-2 transition"
          >
            Regenerate Score
          </button>
        </div>

        {/* Stats */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">Skills</p>
              <Star size={18} className="text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {profile?.skills?.length || 0}
            </p>
            <p className="text-gray-500 text-xs mt-1">Added skills</p>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">Experience</p>
              <Briefcase size={18} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {profile?.experience?.length || 0}
            </p>
            <p className="text-gray-500 text-xs mt-1">Jobs listed</p>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">Portfolio</p>
              <FolderOpen size={18} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {profile?.portfolio?.length || 0}
            </p>
            <p className="text-gray-500 text-xs mt-1">Projects added</p>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm">Avg Rating</p>
              <Star size={18} className="text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {profile?.ratings?.skill
                ? ((profile.ratings.skill +
                    profile.ratings.communication +
                    profile.ratings.reliability) /
                    3
                  ).toFixed(1)
                : "0.0"}
            </p>
            <p className="text-gray-500 text-xs mt-1">Overall rating</p>
          </div>
        </div>
      </div>

      {/* Strengths & Risks */}
      {profile?.credScore?.score > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {profile?.credScore?.strengths?.length > 0 ? (
                profile.credScore.strengths.map((s, i) => (
                  <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {s}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">
                  Generate your score to see strengths
                </li>
              )}
            </ul>
          </div>

          {/* Risks */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {profile?.credScore?.risks?.length > 0 ? (
                profile.credScore.risks.map((r, i) => (
                  <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">!</span>
                    {r}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 text-sm">
                  Generate your score to see risks
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Profile Completion */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Profile Completion</h3>
          <span className="text-brand-400 font-bold">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-dark-600 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {completionItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-sm ${
                item.done ? "text-green-400" : "text-gray-500"
              }`}
            >
              {item.done ? (
                <CheckCircle size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/user/profile"
          className="bg-dark-800 border border-dark-600 hover:border-brand-500 rounded-2xl p-5 flex items-center justify-between group transition"
        >
          <div>
            <p className="text-white font-medium">Complete Your Profile</p>
            <p className="text-gray-500 text-sm mt-1">
              Add skills, experience & portfolio
            </p>
          </div>
          <ArrowRight
            size={20}
            className="text-gray-500 group-hover:text-brand-400 transition"
          />
        </Link>

        <Link
          href="/user/upload"
          className="bg-dark-800 border border-dark-600 hover:border-brand-500 rounded-2xl p-5 flex items-center justify-between group transition"
        >
          <div>
            <p className="text-white font-medium">Upload Resume</p>
            <p className="text-gray-500 text-sm mt-1">
              Upload your CV and proof signals
            </p>
          </div>
          <Upload
            size={20}
            className="text-gray-500 group-hover:text-brand-400 transition"
          />
        </Link>
      </div>

    </div>
  );
}