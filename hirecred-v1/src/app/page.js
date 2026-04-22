"use client";

import Link from "next/link";
import { Shield, Award, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-800">
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Hire<span className="text-brand-500">Cred</span>
          </h1>
          <p className="text-gray-400 text-lg mt-3">
            AI-Powered Trust-Based Hiring Platform
          </p>
        </div>

        {/* Hero Content */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Find Trusted Talent, Faster
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Let AI analyze, score, and rank candidates based on real proof signals,
            client feedback, and verified credentials.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl text-lg transition flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="bg-dark-800 border border-dark-600 hover:border-brand-500 text-white font-semibold px-8 py-3 rounded-xl text-lg transition"
          >
            Sign In
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="bg-dark-800/50 backdrop-blur border border-dark-600 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Award className="text-brand-400" size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              AI Credibility Score
            </h3>
            <p className="text-gray-400 text-sm">
              Candidates get a 0-100 trust score based on skills, experience, portfolio, and proof signals.
            </p>
          </div>

          <div className="bg-dark-800/50 backdrop-blur border border-dark-600 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-brand-400" size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              AI Assistant
            </h3>
            <p className="text-gray-400 text-sm">
              Admin chatbot that answers questions about any applicant and helps with hiring decisions.
            </p>
          </div>

          <div className="bg-dark-800/50 backdrop-blur border border-dark-600 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="text-brand-400" size={24} />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Proof Signals
            </h3>
            <p className="text-gray-400 text-sm">
              GitHub, LinkedIn, client references, and portfolio projects build real credibility.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account as Candidate or Employer" },
              { step: "2", title: "Build Profile", desc: "Add skills, experience, portfolio, and proof signals" },
              { step: "3", title: "Get Scored", desc: "AI analyzes your profile and generates trust score" },
              { step: "4", title: "Get Hired", desc: "Employers find and message top candidates" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold">{item.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Admins & Candidates */}
        <div className="grid md:grid-cols-2 gap-6 mt-16">
          <div className="bg-gradient-to-r from-brand-600/10 to-transparent border border-brand-500/30 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-2">👨‍💼 For Employers</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><CheckCircle size="14" className="text-brand-400" /> AI-powered candidate search</li>
              <li className="flex items-center gap-2"><CheckCircle size="14" className="text-brand-400" /> Smart leaderboard ranking</li>
              <li className="flex items-center gap-2"><CheckCircle size="14" className="text-brand-400" /> AI assistant for quick insights</li>
              <li className="flex items-center gap-2"><CheckCircle size="14" className="text-brand-400" /> Client feedback analysis</li>
            </ul>
            <Link href="/register" className="inline-block mt-4 text-brand-400 hover:text-brand-300 text-sm">
              Register as Employer →
            </Link>
          </div>

          <div className="bg-gradient-to-r from-green-600/10 to-transparent border border-green-500/30 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-2">🎯 For Candidates</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><CheckCircle size="14" className="text-green-400" /> Build your credibility profile</li>
              <li className="flex items-center gap-2"><CheckCircle size="14" className="text-green-400" /> Get AI-generated trust score</li>
              <li className="flex items-center gap-2"><CheckCircle size="14" className="text-green-400" /> Upload resume & proof signals</li>
              <li className="flex items-center gap-2"><CheckCircle size="14" className="text-green-400" /> Connect with employers</li>
            </ul>
            <Link href="/register" className="inline-block mt-4 text-green-400 hover:text-green-300 text-sm">
              Register as Candidate →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-dark-700">
          <p className="text-gray-600 text-sm">
            © 2024 HireCred — Trust-Based Hiring Platform
          </p>
        </div>

      </div>
    </div>
  );
}