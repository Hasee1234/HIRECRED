"use client";

import { useState, useEffect, useRef } from "react";
import {
    Upload,
    File,
    X,
    CheckCircle,
    AlertCircle,
    FileText,
} from "lucide-react";

export default function UploadPage() {
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem("hirecred_user");
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            fetchCurrentResume(parsed.id);
        }
    }, []);

    const fetchCurrentResume = async (userId) => {
        try {
            const res = await fetch(`/api/users/${userId}/profile`);
            const data = await res.json();
            if (res.ok && data.profile?.resumeUrl) {
                setResumeUrl(data.profile.resumeUrl);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileSelect = (file) => {
        setError("");
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
            setError("Only PDF and Word documents are allowed");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        setUploadedFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const uploadResume = async () => {
        if (!uploadedFile || !user) return;
        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();
            formData.append("resume", uploadedFile);
            formData.append("userId", user.id);

            const res = await fetch("/api/upload/resume", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Upload failed");
                return;
            }

            setResumeUrl(data.resumeUrl);
            setSuccess("Resume uploaded successfully!");
            setUploadedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const removeResume = async () => {
        try {
            const res = await fetch(`/api/users/${user.id}/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeUrl: "" }),
            });
            if (res.ok) {
                setResumeUrl("");
                setSuccess("Resume removed successfully");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Upload Resume</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Upload your CV and proof documents to boost your HireCred score
                </p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}

            {/* Current Resume */}
            {resumeUrl && (
                <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
                    <h2 className="text-white font-semibold mb-4">Current Resume</h2>
                    <div className="flex items-center justify-between bg-dark-700 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center">
                                <FileText size={20} className="text-brand-400" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">
                                    Resume on file
                                </p>

                                <a
                                    href={resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-400 text-xs hover:underline"
                                >
                                    View Resume
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={removeResume}
                            className="text-gray-500 hover:text-red-400 transition p-2"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Area */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">
                    {resumeUrl ? "Replace Resume" : "Upload Resume"}
                </h2>

                {/* Drag & Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${dragOver
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-dark-500 hover:border-brand-500/50 hover:bg-dark-700"
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                    <Upload
                        size={40}
                        className={`mx-auto mb-4 ${dragOver ? "text-brand-400" : "text-gray-600"
                            }`}
                    />
                    <p className="text-white font-medium mb-1">
                        Drag & drop your resume here
                    </p>
                    <p className="text-gray-500 text-sm">
                        or click to browse files
                    </p>
                    <p className="text-gray-600 text-xs mt-3">
                        PDF or Word · Max 5MB
                    </p>
                </div>

                {/* Selected File Preview */}
                {uploadedFile && (
                    <div className="mt-4 bg-dark-700 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center">
                                <File size={20} className="text-brand-400" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">
                                    {uploadedFile.name}
                                </p>
                                <p className="text-gray-500 text-xs">
                                    {formatFileSize(uploadedFile.size)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUploadedFile(null)}
                            className="text-gray-500 hover:text-red-400 transition p-2"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Upload Button */}
                {uploadedFile && (
                    <button
                        onClick={uploadResume}
                        disabled={uploading}
                        className="mt-4 w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl py-3 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                Upload Resume
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Tips */}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">
                    Tips to Boost Your Score
                </h2>
                <ul className="space-y-3">
                    {[
                        "Upload a clean, well-formatted PDF resume",
                        "Include your GitHub and LinkedIn in proof signals",
                        "Add at least 2-3 portfolio projects with live links",
                        "List client references to increase trust score",
                        "Keep your bio specific and professional",
                    ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                            <span className="text-brand-400 font-bold mt-0.5">0{i + 1}</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}