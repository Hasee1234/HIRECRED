"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScore, setFilterScore] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const itemsPerPage = 10;

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

  const updateReviewStatus = async (applicantId, status, note) => {
    try {
      const res = await fetch(`/api/admin/applicants/${applicantId}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      if (res.ok) {
        setApplicants((prev) =>
          prev.map((app) =>
            app._id === applicantId
              ? { ...app, reviewed: true, reviewStatus: status, reviewNote: note }
              : app
          )
        );
        setShowReviewModal(false);
        setSelectedApplicant(null);
        setReviewNote("");
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  // Filter applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore =
      filterScore === "all" ||
      (filterScore === "high" && (app.credScore?.score || 0) >= 80) ||
      (filterScore === "medium" &&
        (app.credScore?.score || 0) >= 60 &&
        (app.credScore?.score || 0) < 80) ||
      (filterScore === "low" && (app.credScore?.score || 0) < 60);
    return matchesSearch && matchesScore;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <h1 className="text-2xl font-bold text-white">Applicants</h1>
        <p className="text-gray-400 text-sm mt-1">
          Review and evaluate candidates
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-dark-800 border border-dark-600 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
            className="bg-dark-800 border border-dark-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
          >
            <option value="all">All Scores</option>
            <option value="high">High (80+)</option>
            <option value="medium">Medium (60-79)</option>
            <option value="low">Low (&lt;60)</option>
          </select>
          <button className="bg-dark-800 border border-dark-600 text-gray-400 hover:text-white rounded-xl px-4 py-2.5 transition">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{applicants.length}</p>
          <p className="text-gray-500 text-xs">Total</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {applicants.filter((a) => (a.credScore?.score || 0) >= 80).length}
          </p>
          <p className="text-gray-500 text-xs">High Score</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {applicants.filter(
              (a) =>
                (a.credScore?.score || 0) >= 60 && (a.credScore?.score || 0) < 80
            ).length}
          </p>
          <p className="text-gray-500 text-xs">Medium Score</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">
            {applicants.filter((a) => (a.credScore?.score || 0) < 60).length}
          </p>
          <p className="text-gray-500 text-xs">Low Score</p>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700 border-b border-dark-600">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  HireCred Score
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Skills
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Experience
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600">
              {paginatedApplicants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-gray-500">
                    No applicants found
                  </td>
                </tr>
              ) : (
                paginatedApplicants.map((applicant) => (
                  <tr key={applicant._id} className="hover:bg-dark-700 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-semibold text-sm">
                          {applicant.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {applicant.name}
                          </p>
                          <p className="text-gray-500 text-xs">{applicant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getScoreBg(
                          applicant.credScore?.score || 0
                        )}`}
                      >
                        <Award size={12} className="mr-1" />
                        <span className={getScoreColor(applicant.credScore?.score || 0)}>
                          {applicant.credScore?.score || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills?.slice(0, 2).map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs bg-dark-600 text-gray-300 px-2 py-0.5 rounded-full"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {applicant.skills?.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{applicant.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">
                      {applicant.experience?.length || 0} yrs
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">
                      {new Date(applicant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {applicant.reviewed ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle size={12} />
                          Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-400 text-xs">
                          <AlertCircle size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/applicants/${applicant._id}`}
                          className="p-1.5 text-gray-400 hover:text-brand-400 transition"
                        >
                          <Eye size={16} />
                        </Link>
                        {!applicant.reviewed && (
                          <button
                            onClick={() => {
                              setSelectedApplicant(applicant);
                              setShowReviewModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-green-400 transition"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-dark-600 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
              <h3 className="text-white font-semibold">Review Applicant</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedApplicant(null);
                  setReviewNote("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-white font-medium mb-1">{selectedApplicant.name}</p>
              <p className="text-gray-500 text-sm mb-4">{selectedApplicant.email}</p>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  placeholder="Add your comments about this candidate..."
                  className="w-full bg-dark-700 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => updateReviewStatus(selectedApplicant._id, "shortlisted", reviewNote)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 text-sm font-medium transition"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => updateReviewStatus(selectedApplicant._id, "rejected", reviewNote)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-medium transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}