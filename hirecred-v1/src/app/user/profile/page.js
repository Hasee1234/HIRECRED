"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Code,
  LinkedinIcon,  // ← Changed from Linkedin to LinkedinIcon
  Briefcase,
  FolderOpen,
  User,
  CheckCircle,
} from "lucide-react";
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [profile, setProfile] = useState({
    bio: "",
    skills: [],
    experience: [],
    portfolio: [],
    proofSignals: {
      githubUrl: "",
      linkedinUrl: "",
      clientReferences: [],
    },
  });

  const [newSkill, setNewSkill] = useState({ name: "", level: "intermediate" });
  const [newExperience, setNewExperience] = useState({
    company: "",
    role: "",
    years: "",
    description: "",
  });
  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    url: "",
    description: "",
  });
  const [newReference, setNewReference] = useState({
    name: "",
    email: "",
  });

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
      if (res.ok && data.profile) {
        setProfile({
          bio: data.profile.bio || "",
          skills: data.profile.skills || [],
          experience: data.profile.experience || [],
          portfolio: data.profile.portfolio || [],
          proofSignals: data.profile.proofSignals || {
            githubUrl: "",
            linkedinUrl: "",
            clientReferences: [],
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, { ...newSkill }],
    }));
    setNewSkill({ name: "", level: "intermediate" });
  };

  const removeSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    if (!newExperience.company.trim() || !newExperience.role.trim()) return;
    setProfile((prev) => ({
      ...prev,
      experience: [...prev.experience, { ...newExperience }],
    }));
    setNewExperience({ company: "", role: "", years: "", description: "" });
  };

  const removeExperience = (index) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addPortfolio = () => {
    if (!newPortfolio.title.trim()) return;
    setProfile((prev) => ({
      ...prev,
      portfolio: [...prev.portfolio, { ...newPortfolio }],
    }));
    setNewPortfolio({ title: "", url: "", description: "" });
  };

  const removePortfolio = (index) => {
    setProfile((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  };

  const addReference = () => {
    if (!newReference.name.trim()) return;
    setProfile((prev) => ({
      ...prev,
      proofSignals: {
        ...prev.proofSignals,
        clientReferences: [
          ...prev.proofSignals.clientReferences,
          { ...newReference, verified: false },
        ],
      },
    }));
    setNewReference({ name: "", email: "" });
  };

  const removeReference = (index) => {
    setProfile((prev) => ({
      ...prev,
      proofSignals: {
        ...prev.proofSignals,
        clientReferences: prev.proofSignals.clientReferences.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "skills", label: "Skills", icon: CheckCircle },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "portfolio", label: "Portfolio", icon: FolderOpen },
    { id: "proof", label: "Proof Signals", icon: Code },  // ← Changed from Github to Code
  ];

  const skillLevelColors = {
    beginner: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    expert: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            Build your credibility profile
          </p>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              {saving ? "Saving..." : "Save Profile"}
            </>
          )}
        </button>
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

        {/* Basic Info */}
        {activeTab === "basic" && (
          <div className="space-y-5">
            <h2 className="text-white font-semibold text-lg">Basic Information</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Professional Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={5}
                maxLength={500}
                placeholder="Tell employers about yourself, your expertise, and what makes you unique..."
                className="w-full bg-dark-700 border border-dark-500 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
              />
              <p className="text-gray-600 text-xs mt-1 text-right">
                {profile.bio.length}/500
              </p>
            </div>
          </div>
        )}

        {/* Skills */}
        {activeTab === "skills" && (
          <div className="space-y-5">
            <h2 className="text-white font-semibold text-lg">Skills</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. React, Python, Design..."
                className="flex-1 bg-dark-700 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
              />
              <select
                value={newSkill.level}
                onChange={(e) =>
                  setNewSkill((prev) => ({ ...prev, level: e.target.value }))
                }
                className="bg-dark-700 border border-dark-500 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
              <button
                onClick={addSkill}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg transition"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              )}
              {profile.skills.map((skill, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${
                    skillLevelColors[skill.level]
                  }`}
                >
                  <span>{skill.name}</span>
                  <span className="text-xs opacity-70">· {skill.level}</span>
                  <button
                    onClick={() => removeSkill(i)}
                    className="hover:opacity-70 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {activeTab === "experience" && (
          <div className="space-y-5">
            <h2 className="text-white font-semibold text-lg">Experience</h2>
            <div className="bg-dark-700 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Company name"
                  className="bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
                />
                <input
                  type="text"
                  value={newExperience.role}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  placeholder="Job role / title"
                  className="bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
              <input
                type="number"
                value={newExperience.years}
                onChange={(e) =>
                  setNewExperience((prev) => ({
                    ...prev,
                    years: e.target.value,
                  }))
                }
                placeholder="Years of experience"
                className="w-full bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
              />
              <textarea
                value={newExperience.description}
                onChange={(e) =>
                  setNewExperience((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Describe your role and achievements..."
                className="w-full bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
              />
              <button
                onClick={addExperience}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                <Plus size={16} />
                Add Experience
              </button>
            </div>
            <div className="space-y-3">
              {profile.experience.length === 0 && (
                <p className="text-gray-500 text-sm">No experience added yet</p>
              )}
              {profile.experience.map((exp, i) => (
                <div
                  key={i}
                  className="bg-dark-700 rounded-xl p-4 flex justify-between items-start"
                >
                  <div>
                    <p className="text-white font-medium">{exp.role}</p>
                    <p className="text-brand-400 text-sm">{exp.company}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {exp.years} year{exp.years > 1 ? "s" : ""}
                    </p>
                    {exp.description && (
                      <p className="text-gray-400 text-sm mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeExperience(i)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {activeTab === "portfolio" && (
          <div className="space-y-5">
            <h2 className="text-white font-semibold text-lg">Portfolio</h2>
            <div className="bg-dark-700 rounded-xl p-4 space-y-3">
              <input
                type="text"
                value={newPortfolio.title}
                onChange={(e) =>
                  setNewPortfolio((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Project title"
                className="w-full bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
              />
              <input
                type="url"
                value={newPortfolio.url}
                onChange={(e) =>
                  setNewPortfolio((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="Project URL (https://...)"
                className="w-full bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
              />
              <textarea
                value={newPortfolio.description}
                onChange={(e) =>
                  setNewPortfolio((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Describe this project..."
                className="w-full bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition resize-none"
              />
              <button
                onClick={addPortfolio}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                <Plus size={16} />
                Add Project
              </button>
            </div>
            <div className="space-y-3">
              {profile.portfolio.length === 0 && (
                <p className="text-gray-500 text-sm">No projects added yet</p>
              )}
              {profile.portfolio.map((item, i) => (
                <div
                  key={i}
                  className="bg-dark-700 rounded-xl p-4 flex justify-between items-start"
                >
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
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
                      <p className="text-gray-400 text-sm mt-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removePortfolio(i)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proof Signals */}
        {activeTab === "proof" && (
          <div className="space-y-5">
            <h2 className="text-white font-semibold text-lg">Proof Signals</h2>
            <p className="text-gray-500 text-sm">
              These signals boost your HireCred score significantly
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Code size={18} className="text-gray-400" />
                <input
                  type="url"
                  value={profile.proofSignals.githubUrl}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      proofSignals: {
                        ...prev.proofSignals,
                        githubUrl: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://github.com/username"
                  className="flex-1 bg-dark-700 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
                />
              </div>
              <div className="flex items-center gap-3">
  <LinkedinIcon size={18} className="text-gray-400" />
  <input
    type="url"
    value={profile.proofSignals.linkedinUrl}
    onChange={(e) =>
      setProfile((prev) => ({
        ...prev,
        proofSignals: {
          ...prev.proofSignals,
          linkedinUrl: e.target.value,
        },
      }))
    }
    placeholder="https://linkedin.com/in/username"
    className="flex-1 bg-dark-700 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
  />
</div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-3">Client References</h3>
              <div className="bg-dark-700 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newReference.name}
                    onChange={(e) =>
                      setNewReference((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Client name"
                    className="bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
                  />
                  <input
                    type="email"
                    value={newReference.email}
                    onChange={(e) =>
                      setNewReference((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Client email"
                    className="bg-dark-600 border border-dark-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
                <button
                  onClick={addReference}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  <Plus size={16} />
                  Add Reference
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {profile.proofSignals.clientReferences.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No references added yet
                  </p>
                )}
                {profile.proofSignals.clientReferences.map((ref, i) => (
                  <div
                    key={i}
                    className="bg-dark-700 rounded-xl p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {ref.name}
                      </p>
                      <p className="text-gray-500 text-xs">{ref.email}</p>
                    </div>
                    <button
                      onClick={() => removeReference(i)}
                      className="text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}