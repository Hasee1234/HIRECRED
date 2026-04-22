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
  Trophy,
  Sparkles,
  Sliders,
  Search,
} from "lucide-react";

export default function SmartSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    skills: [],
    minExperience: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          filters: filters,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      setFilters({
        ...filters,
        skills: [...filters.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter(s => s !== skill),
    });
  };

  const clearFilters = () => {
    setFilters({
      minScore: 0,
      skills: [],
      minExperience: 0,
    });
  };

  const exampleQueries = [
    "Find React developers with 5+ years experience",
    "Show me candidates who are experts in Python and have good communication",
    "Top candidates for a senior frontend role",
    "Find reliable freelancers with client references",
    "Candidates with strong problem-solving skills",
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-400/10 border-green-500/30";
    if (score >= 60) return "bg-yellow-400/10 border-yellow-500/30";
    return "bg-red-400/10 border-red-500/30";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-brand-400" size={24} />
          AI Smart Search
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Describe the candidate you're looking for and let AI find the best matches
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Describe your ideal candidate... (e.g., 'Find a senior full-stack developer with 5+ years of React experience, strong leadership skills, and excellent communication')"
              rows={3}
              className="w-full bg-dark-700 border border-dark-500 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white rounded-lg text-sm transition border border-dark-500"
            >
              <Sliders size={14} />
              Filters
              {(filters.minScore > 0 || filters.skills.length > 0 || filters.minExperience > 0) && (
                <span className="w-2 h-2 bg-brand-400 rounded-full" />
              )}
            </button>
            
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {isSearching ? "Searching..." : "Search Candidates"}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-dark-700 rounded-xl border border-dark-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium text-sm">Advanced Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-brand-400 transition"
                >
                  Clear all
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Min Score */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">
                    Min HireCred Score: {filters.minScore}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minScore}
                    onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                    className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                {/* Min Experience */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">
                    Min Experience: {filters.minExperience} years
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={filters.minExperience}
                    onChange={(e) => setFilters({ ...filters, minExperience: parseInt(e.target.value) })}
                    className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">
                    Required Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      placeholder="e.g., React, Python"
                      className="flex-1 bg-dark-600 border border-dark-500 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={addSkill}
                      className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-full text-xs"
                      >
                        {skill}
                        <button onClick={() => removeSkill(skill)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Example Queries */}
      {!hasSearched && (
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3 text-sm">Example searches</h2>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((query, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(query)}
                className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white px-3 py-1.5 rounded-full border border-dark-500 transition"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </h2>
            {results.length > 0 && (
              <p className="text-gray-500 text-xs">Ranked by relevance</p>
            )}
          </div>

          {isSearching ? (
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-12 text-center">
              <Loader2 size={32} className="animate-spin text-brand-400 mx-auto mb-3" />
              <p className="text-gray-400">AI is analyzing candidates...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-12 text-center">
              <Search size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No candidates match your search</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search query or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((applicant, idx) => (
                <div
                  key={applicant._id}
                  className="bg-dark-800 border border-dark-600 rounded-2xl p-5 hover:border-brand-500/50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-brand-400">
                          {applicant.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold">{applicant.name}</h3>
                          {applicant.relevanceScore && (
                            <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">
                              {Math.round(applicant.relevanceScore)}% match
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">{applicant.email}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Briefcase size={10} />
                            {applicant.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0} yrs exp
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Star size={10} />
                            {applicant.skills?.length || 0} skills
                          </span>
                        </div>
                        {applicant.matchedSkills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {applicant.matchedSkills.map((skill, i) => (
                              <span key={i} className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm ${getScoreBg(applicant.credScore?.score || 0)}`}>
                          <Award size={12} />
                          <span className={getScoreColor(applicant.credScore?.score || 0)}>
                            {applicant.credScore?.score || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((i) => {
                            const avgRating = applicant.ratings?.skill && applicant.ratings?.communication && applicant.ratings?.reliability
                              ? (applicant.ratings.skill + applicant.ratings.communication + applicant.ratings.reliability) / 3
                              : 0;
                            return (
                              <Star
                                key={i}
                                size={12}
                                className={`${
                                  i <= Math.round(avgRating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-600"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <Link
                        href={`/admin/applicants/${applicant._id}`}
                        className="p-2 text-gray-500 hover:text-brand-400 transition"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>

                  {/* AI Match Reason */}
                  {applicant.matchReason && (
                    <div className="mt-3 pt-3 border-t border-dark-600">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles size={10} className="text-brand-400" />
                        Why matched:
                      </p>
                      <p className="text-sm text-gray-400 mt-1">{applicant.matchReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}