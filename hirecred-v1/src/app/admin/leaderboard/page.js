"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Star,
  Eye,
  TrendingUp,
  Medal,
  Crown,
  Sparkles,
} from "lucide-react";

export default function LeaderboardPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("score"); // score, rating, experience

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await fetch("/api/admin/applicants");
      const data = await res.json();
      if (res.ok) {
        setApplicants(data.applicants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedApplicants = () => {
    const sorted = [...applicants];
    if (sortBy === "score") {
      sorted.sort((a, b) => (b.credScore?.score || 0) - (a.credScore?.score || 0));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => {
        const ratingA = (a.ratings?.skill + a.ratings?.communication + a.ratings?.reliability) / 3 || 0;
        const ratingB = (b.ratings?.skill + b.ratings?.communication + b.ratings?.reliability) / 3 || 0;
        return ratingB - ratingA;
      });
    } else if (sortBy === "experience") {
      sorted.sort((a, b) => {
        const expA = a.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0;
        const expB = b.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0;
        return expB - expA;
      });
    }
    return sorted;
  };

  const getMedalColor = (index) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-amber-600";
    return "text-gray-600";
  };

  const getMedalIcon = (index) => {
    if (index === 0) return <Crown size={20} className="text-yellow-400" />;
    if (index === 1) return <Medal size={20} className="text-gray-400" />;
    if (index === 2) return <Medal size={20} className="text-amber-600" />;
    return <span className="text-gray-500 text-sm font-bold w-5 text-center">{index + 1}</span>;
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return { label: "Elite", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
    if (score >= 80) return { label: "Excellent", color: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (score >= 70) return { label: "Good", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    if (score >= 60) return { label: "Average", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    return { label: "Needs Work", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  };

  const sortedApplicants = getSortedApplicants();
  const topThree = sortedApplicants.slice(0, 3);
  const restApplicants = sortedApplicants.slice(3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="text-yellow-400" size={28} />
          Candidate Leaderboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Ranked by HireCred credibility score
        </p>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setSortBy("score")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            sortBy === "score"
              ? "bg-brand-600 text-white"
              : "bg-dark-800 text-gray-400 hover:text-white border border-dark-600"
          }`}
        >
          <Award size={14} className="inline mr-1" />
          By Score
        </button>
        <button
          onClick={() => setSortBy("rating")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            sortBy === "rating"
              ? "bg-brand-600 text-white"
              : "bg-dark-800 text-gray-400 hover:text-white border border-dark-600"
          }`}
        >
          <Star size={14} className="inline mr-1" />
          By Rating
        </button>
        <button
          onClick={() => setSortBy("experience")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            sortBy === "experience"
              ? "bg-brand-600 text-white"
              : "bg-dark-800 text-gray-400 hover:text-white border border-dark-600"
          }`}
        >
          <TrendingUp size={14} className="inline mr-1" />
          By Experience
        </button>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 text-center order-2 md:order-1">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-gray-400/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">2</span>
                </div>
              </div>
              <h3 className="text-white font-semibold">{topThree[1].name}</h3>
              <p className="text-gray-500 text-xs mt-1">{topThree[1].email}</p>
              <div className="mt-3">
                <span className="text-3xl font-bold text-gray-400">
                  {topThree[1].credScore?.score || 0}
                </span>
                <span className="text-gray-500 text-sm">/100</span>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">
                  <Medal size={10} />
                  Runner Up
                </span>
              </div>
              <Link
                href={`/admin/applicants/${topThree[1]._id}`}
                className="inline-flex items-center gap-1 mt-4 text-brand-400 text-sm hover:underline"
              >
                View Profile <Eye size={12} />
              </Link>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="bg-gradient-to-b from-brand-600/20 to-dark-800 border-2 border-brand-500 rounded-2xl p-5 text-center order-1 md:order-2 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Crown size={24} className="text-yellow-400" />
              </div>
              <div className="flex justify-center mb-3 mt-2">
                <div className="w-20 h-20 rounded-full bg-brand-600/30 flex items-center justify-center border-2 border-brand-500">
                  <span className="text-3xl font-bold text-brand-400">1</span>
                </div>
              </div>
              <h3 className="text-white font-bold text-lg">{topThree[0].name}</h3>
              <p className="text-gray-400 text-xs mt-1">{topThree[0].email}</p>
              <div className="mt-3">
                <span className="text-4xl font-bold text-brand-400">
                  {topThree[0].credScore?.score || 0}
                </span>
                <span className="text-gray-500 text-sm">/100</span>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">
                  <Sparkles size={10} />
                  Top Performer
                </span>
              </div>
              <Link
                href={`/admin/applicants/${topThree[0]._id}`}
                className="inline-flex items-center gap-1 mt-4 text-brand-400 text-sm hover:underline"
              >
                View Profile <Eye size={12} />
              </Link>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 text-center order-3">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-600">3</span>
                </div>
              </div>
              <h3 className="text-white font-semibold">{topThree[2].name}</h3>
              <p className="text-gray-500 text-xs mt-1">{topThree[2].email}</p>
              <div className="mt-3">
                <span className="text-3xl font-bold text-amber-600">
                  {topThree[2].credScore?.score || 0}
                </span>
                <span className="text-gray-500 text-sm">/100</span>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-xs bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded-full">
                  <Medal size={10} />
                  Third Place
                </span>
              </div>
              <Link
                href={`/admin/applicants/${topThree[2]._id}`}
                className="inline-flex items-center gap-1 mt-4 text-brand-400 text-sm hover:underline"
              >
                View Profile <Eye size={12} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Rest of the Leaderboard */}
      {restApplicants.length > 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-600">
            <h2 className="text-white font-semibold">All Candidates</h2>
          </div>
          <div className="divide-y divide-dark-600">
            {restApplicants.map((applicant, idx) => {
              const globalIndex = idx + 3;
              const scoreBadge = getScoreBadge(applicant.credScore?.score || 0);
              const avgRating = applicant.ratings?.skill && applicant.ratings?.communication && applicant.ratings?.reliability
                ? ((applicant.ratings.skill + applicant.ratings.communication + applicant.ratings.reliability) / 3).toFixed(1)
                : "N/A";
              
              return (
                <div
                  key={applicant._id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-dark-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center">
                      {getMedalIcon(globalIndex)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{applicant.name}</p>
                      <p className="text-gray-500 text-xs">{applicant.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {applicant.credScore?.score || 0}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${scoreBadge.color}`}>
                        {scoreBadge.label}
                      </span>
                    </div>
                    
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={12}
                            className={`${
                              i <= Math.round(avgRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{avgRating}/5</p>
                    </div>
                    
                    <div className="text-right hidden md:block">
                      <p className="text-gray-400 text-sm">
                        {applicant.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0} yrs
                      </p>
                      <p className="text-gray-500 text-xs">
                        {applicant.skills?.length || 0} skills
                      </p>
                    </div>
                    
                    <Link
                      href={`/admin/applicants/${applicant._id}`}
                      className="p-2 text-gray-500 hover:text-brand-400 transition"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {applicants.length > 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Leaderboard Insights</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Top Score</p>
              <p className="text-2xl font-bold text-brand-400">
                {Math.max(...applicants.map(a => a.credScore?.score || 0))}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Average Score</p>
              <p className="text-2xl font-bold text-white">
                {Math.round(applicants.reduce((sum, a) => sum + (a.credScore?.score || 0), 0) / applicants.length)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total Candidates</p>
              <p className="text-2xl font-bold text-white">{applicants.length}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Elite (90+)</p>
              <p className="text-2xl font-bold text-purple-400">
                {applicants.filter(a => (a.credScore?.score || 0) >= 90).length}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}