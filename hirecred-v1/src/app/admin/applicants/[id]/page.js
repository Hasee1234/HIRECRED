"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Star,
  Briefcase,
  FolderOpen,
  Github,
  Linkedin,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  TrendingUp,
  Shield,
  User,
  FileText,
} from "lucide-react";

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  useEffect(() => {
    fetchApplicant();
  }, [params.id]);

  const fetchApplicant = async () => {
    try {
      const res = await fetch(`/api/admin/applicants/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setApplicant(data.applicant);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSendingFeedback(true);
    try {
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: applicant._id,
          feedbackText: feedbackText,
        }),
      });
      if (res.ok) {
        setShowFeedbackModal(false);
        setFeedbackText("");
        fetchApplicant(); // Refresh data
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingFeedback(false);
    }
  };

  const regenerateScore = async () => {
    try {
      const res = await fetch("/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: applicant._id }),
      });
      if (res.ok) {
        fetchApplicant();
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

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "skills", label: "Skills", icon: Star },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "portfolio", label: "Portfolio", icon: FolderOpen },
    { id: "proof", label: "Proof Signals", icon: Shield },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Applicant not found</p>
        <Link href="/admin/applicants" className="text-brand-400 hover:underline mt-2 inline-block">
          Back to Applicants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Back Button */}
      <Link
        href="/admin/applicants"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition mb-2"
      >
        <ArrowLeft size={16} />
        Back to Applicants
      </Link>

      {/* Header Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-600/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-brand-400">
                {applicant.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{applicant.name}</h1>
              <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                <Mail size={14} />
                {applicant.email}
                <Calendar size={14} className="ml-2" />
                Joined {new Date(applicant.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={regenerateScore}
              className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-white border border-dark-500 rounded-xl px-4 py-2 text-sm transition"
            >
              <TrendingUp size={16} />
              Regenerate Score
            </button>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2 text-sm transition"
            >
              <MessageSquare size={16} />
              Add Feedback
            </button>
          </div>
        </div>

        {/* Score Section */}
        <div className="mt-6 pt-6 border-t border-dark-600">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* HireCred Score */}
            <div className="bg-dark-700 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs mb-1">HireCred Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(applicant.credScore?.score || 0)}`}>
                {applicant.credScore?.score || 0}
              </p>
              <p className="text-gray-500 text-xs">/100</p>
              <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (applicant.credScore?.score || 0) >= 80
                      ? "bg-green-500"
                      : (applicant.credScore?.score || 0) >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${applicant.credScore?.score || 0}%` }}
                />
              </div>
            </div>

            {/* Ratings */}
            <div className="bg-dark-700 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs mb-1">Skill Rating</p>
              <p className="text-2xl font-bold text-white">
                {applicant.ratings?.skill || 0}
              </p>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`${
                      i <= (applicant.ratings?.skill || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-dark-700 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs mb-1">Communication</p>
              <p className="text-2xl font-bold text-white">
                {applicant.ratings?.communication || 0}
              </p>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`${
                      i <= (applicant.ratings?.communication || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-dark-700 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs mb-1">Reliability</p>
              <p className="text-2xl font-bold text-white">
                {applicant.ratings?.reliability || 0}
              </p>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`${
                      i <= (applicant.ratings?.reliability || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Risks */}
        {(applicant.credScore?.strengths?.length > 0 || applicant.credScore?.risks?.length > 0) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {applicant.credScore?.strengths?.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <h3 className="text-green-400 font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={14} />
                  Strengths
                </h3>
                <ul className="space-y-1">
                  {applicant.credScore.strengths.map((s, i) => (
                    <li key={i} className="text-gray-300 text-sm">• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {applicant.credScore?.risks?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <h3 className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle size={14} />
                  Areas to Improve
                </h3>
                <ul className="space-y-1">
                  {applicant.credScore.risks.map((r, i) => (
                    <li key={i} className="text-gray-300 text-sm">• {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-brand-600 text-white"
                  : "bg-dark-800 text-gray-400 hover:text-white border border-dark-600"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white font-semibold mb-2">Bio</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {applicant.bio || "No bio provided yet."}
              </p>
            </div>

            {applicant.resumeUrl && (
              <div>
                <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Resume
                </h2>
                <a
                  href={applicant.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm"
                >
                  <Download size={14} />
                  Download Resume
                </a>
              </div>
            )}

            <div>
              <h2 className="text-white font-semibold mb-2">Quick Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-dark-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {applicant.skills?.length || 0}
                  </p>
                  <p className="text-gray-500 text-xs">Skills</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {applicant.experience?.length || 0}
                  </p>
                  <p className="text-gray-500 text-xs">Experiences</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {applicant.portfolio?.length || 0}
                  </p>
                  <p className="text-gray-500 text-xs">Projects</p>
                </div>
                <div className="bg-dark-700 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-white">
                    {applicant.ratings?.totalFeedbacks || 0}
                  </p>
                  <p className="text-gray-500 text-xs">Feedbacks</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div>
            {applicant.skills?.length === 0 ? (
              <p className="text-gray-500 text-sm">No skills added yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {applicant.skills.map((skill, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      skill.level === "expert"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : skill.level === "intermediate"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }`}
                  >
                    {skill.name}
                    <span className="text-xs ml-1 opacity-70">· {skill.level}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            {applicant.experience?.length === 0 ? (
              <p className="text-gray-500 text-sm">No experience added yet</p>
            ) : (
              applicant.experience.map((exp, i) => (
                <div key={i} className="bg-dark-700 rounded-xl p-4">
                  <h3 className="text-white font-semibold">{exp.role}</h3>
                  <p className="text-brand-400 text-sm">{exp.company}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {exp.years} year{exp.years > 1 ? "s" : ""}
                  </p>
                  {exp.description && (
                    <p className="text-gray-400 text-sm mt-2">{exp.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="space-y-4">
            {applicant.portfolio?.length === 0 ? (
              <p className="text-gray-500 text-sm">No portfolio items added yet</p>
            ) : (
              applicant.portfolio.map((item, i) => (
                <div key={i} className="bg-dark-700 rounded-xl p-4">
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 text-sm hover:underline"
                    >
                      {item.url}
                    </a>
                  )}
                  {item.description && (
                    <p className="text-gray-400 text-sm mt-2">{item.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Proof Signals Tab */}
        {activeTab === "proof" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                <Github size={16} />
                GitHub
              </h3>
              {applicant.proofSignals?.githubUrl ? (
                <a
                  href={applicant.proofSignals.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 text-sm hover:underline"
                >
                  {applicant.proofSignals.githubUrl}
                </a>
              ) : (
                <p className="text-gray-500 text-sm">Not provided</p>
              )}
            </div>

            <div>
              <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                <Linkedin size={16} />
                LinkedIn
              </h3>
              {applicant.proofSignals?.linkedinUrl ? (
                <a
                  href={applicant.proofSignals.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 text-sm hover:underline"
                >
                  {applicant.proofSignals.linkedinUrl}
                </a>
              ) : (
                <p className="text-gray-500 text-sm">Not provided</p>
              )}
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Client References</h3>
              {applicant.proofSignals?.clientReferences?.length === 0 ? (
                <p className="text-gray-500 text-sm">No references added</p>
              ) : (
                <div className="space-y-2">
                  {applicant.proofSignals.clientReferences.map((ref, i) => (
                    <div key={i} className="bg-dark-700 rounded-lg p-3">
                      <p className="text-white text-sm">{ref.name}</p>
                      <p className="text-gray-500 text-xs">{ref.email}</p>
                      {ref.verified && (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs mt-1">
                          <CheckCircle size={10} />
                          Verified
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            {applicant.feedbacks?.length === 0 ? (
              <p className="text-gray-500 text-sm">No feedback yet</p>
            ) : (
              applicant.feedbacks.map((fb, i) => (
                <div key={i} className="bg-dark-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-medium">
                      {fb.projectTitle || "Client Feedback"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">{fb.rawText}</p>
                  {fb.aiProcessed && (
                    <div className="mt-3 pt-3 border-t border-dark-600 flex gap-4 text-xs">
                      <span className="text-gray-400">
                        Skill: <span className="text-yellow-400">{fb.aiProcessed.skillRating}/5</span>
                      </span>
                      <span className="text-gray-400">
                        Comm: <span className="text-yellow-400">{fb.aiProcessed.communicationRating}/5</span>
                      </span>
                      <span className="text-gray-400">
                        Reliability: <span className="text-yellow-400">{fb.aiProcessed.reliabilityRating}/5</span>
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
              <h3 className="text-white font-semibold">Add Client Feedback</h3>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <AlertCircle size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-400 text-sm mb-4">
                Enter client feedback for <span className="text-white">{applicant.name}</span>
              </p>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={5}
                placeholder="Paste client feedback here... This will be analyzed by AI to update the candidate's ratings."
                className="w-full bg-dark-700 border border-dark-500 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText("");
                  }}
                  className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-400 rounded-lg py-2.5 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={sendFeedback}
                  disabled={sendingFeedback || !feedbackText.trim()}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
                >
                  {sendingFeedback ? "Processing..." : "Submit & Analyze"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}