import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Feedback from "@/models/Feedback";
import { getCurrentUser } from "@/lib/auth";

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Helper function to call Gemini API
async function callGemini(prompt) {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    console.error("Gemini API error:", data.error);
    throw new Error(data.error.message || "AI service error");
  }
  
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that request.";
}

// Get all applicants data for context
async function getAllApplicantsData() {
  const users = await User.find({ role: "user", isActive: true }).select("-password");
  const applicantsData = [];
  
  for (const user of users) {
    const profile = await Profile.findOne({ userId: user._id });
    const feedbacks = await Feedback.find({ toUserId: user._id });
    
    const avgRating = profile?.ratings ? 
      ((profile.ratings.skill + profile.ratings.communication + profile.ratings.reliability) / 3).toFixed(1) : 0;
    
    const totalExp = profile?.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0;
    
    applicantsData.push({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      credScore: profile?.credScore?.score || 0,
      strengths: profile?.credScore?.strengths || [],
      risks: profile?.credScore?.risks || [],
      skills: profile?.skills?.map(s => s.name) || [],
      totalExperience: totalExp,
      avgRating: avgRating,
      portfolioCount: profile?.portfolio?.length || 0,
      hasGithub: !!profile?.proofSignals?.githubUrl,
      hasLinkedin: !!profile?.proofSignals?.linkedinUrl,
      referencesCount: profile?.proofSignals?.clientReferences?.length || 0,
      feedbackCount: feedbacks.length,
      bio: profile?.bio || "",
      joinedDate: user.createdAt,
    });
  }
  
  return applicantsData;
}

// Generate system prompt with context
async function generateSystemPrompt() {
  const applicants = await getAllApplicantsData();
  
  const topPerformers = [...applicants]
    .sort((a, b) => b.credScore - a.credScore)
    .slice(0, 5);
  
  const stats = {
    totalApplicants: applicants.length,
    averageScore: applicants.length > 0 
      ? Math.round(applicants.reduce((sum, a) => sum + a.credScore, 0) / applicants.length) 
      : 0,
    topScore: applicants.length > 0 ? Math.max(...applicants.map(a => a.credScore)) : 0,
    totalWithGithub: applicants.filter(a => a.hasGithub).length,
    totalWithReferences: applicants.filter(a => a.referencesCount > 0).length,
  };
  
  return `You are HireCred AI Assistant, an intelligent hiring assistant for recruiters and admins. You help with candidate evaluation, screening, and hiring decisions.

CURRENT DATABASE SUMMARY:
- Total Applicants: ${stats.totalApplicants}
- Average HireCred Score: ${stats.averageScore}
- Highest Score: ${stats.topScore}
- Candidates with GitHub: ${stats.totalWithGithub}
- Candidates with References: ${stats.totalWithReferences}

TOP 5 CANDIDATES:
${topPerformers.map((c, i) => `${i+1}. ${c.name} - Score: ${c.credScore}, Skills: ${c.skills.slice(0,3).join(", ")}, Exp: ${c.totalExperience}yrs`).join("\n")}

ALL CANDIDATES DATA:
${JSON.stringify(applicants, null, 2)}

CAPABILITIES:
- Answer questions about any candidate's profile, skills, experience, and scores
- Compare candidates against each other
- Identify top performers for specific skills
- Flag potential risks or concerns
- Suggest interview questions based on candidate profile
- Provide hiring recommendations

RULES:
1. Be helpful, professional, and concise
2. Always base answers on the provided data
3. If asked about a candidate not in the list, say you don't have that information
4. For comparisons, highlight key differences
5. Never invent or hallucinate data
6. Keep responses under 200 words when possible
7. Use bullet points for lists to improve readability`;
}

export async function POST(request) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }
    
    const body = await request.json();
    const { message, history = [] } = body;
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    // Generate system prompt with fresh data
    const systemPrompt = await generateSystemPrompt();
    
    // Build conversation history
    let conversationHistory = systemPrompt + "\n\n";
    
    // Add previous messages (last 5 exchanges to keep context manageable)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      conversationHistory += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}\n`;
    }
    
    conversationHistory += `User: ${message}\nAssistant:`;
    
    let reply;
    
    // Use AI if API key exists, otherwise fallback
    if (GEMINI_API_KEY) {
      try {
        reply = await callGemini(conversationHistory);
      } catch (aiError) {
        console.error("AI assistant error:", aiError);
        reply = fallbackResponse(message, await getAllApplicantsData());
      }
    } else {
      reply = fallbackResponse(message, await getAllApplicantsData());
    }
    
    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("Assistant error:", error);
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble connecting. Please try again in a moment." },
      { status: 500 }
    );
  }
}

// Fallback responses without AI
function fallbackResponse(message, applicants) {
  const lowerMsg = message.toLowerCase();
  
  // Top candidates
  if (lowerMsg.includes("top") || lowerMsg.includes("best") || lowerMsg.includes("highest score")) {
    const sorted = [...applicants].sort((a, b) => b.credScore - a.credScore).slice(0, 5);
    if (sorted.length === 0) return "No candidates in the database yet.";
    
    let response = "🏆 **Top Candidates by HireCred Score:**\n\n";
    sorted.forEach((c, i) => {
      response += `${i+1}. **${c.name}** - Score: ${c.credScore}\n`;
      response += `   Skills: ${c.skills.slice(0, 3).join(", ") || "None listed"}\n`;
      response += `   Experience: ${c.totalExperience} years\n\n`;
    });
    return response;
  }
  
  // Total count
  if (lowerMsg.includes("how many") || lowerMsg.includes("total applicants") || lowerMsg.includes("count")) {
    return `📊 **Database Summary:**\n\n- Total Applicants: ${applicants.length}\n- Average Score: ${Math.round(applicants.reduce((sum, a) => sum + a.credScore, 0) / (applicants.length || 1))}\n- With GitHub: ${applicants.filter(a => a.hasGithub).length}\n- With References: ${applicants.filter(a => a.referencesCount > 0).length}`;
  }
  
  // Specific candidate search
  const possibleName = message.split(" ").find(word => word.length > 2);
  const candidate = applicants.find(a => 
    a.name.toLowerCase().includes(lowerMsg) || 
    lowerMsg.includes(a.name.toLowerCase())
  );
  
  if (candidate) {
    return `📄 **${candidate.name}**\n\n- HireCred Score: ${candidate.credScore}/100\n- Skills: ${candidate.skills.join(", ") || "None listed"}\n- Experience: ${candidate.totalExperience} years\n- Portfolio: ${candidate.portfolioCount} projects\n- Client References: ${candidate.referencesCount}\n- GitHub: ${candidate.hasGithub ? "✅ Yes" : "❌ No"}\n- LinkedIn: ${candidate.hasLinkedin ? "✅ Yes" : "❌ No"}\n- Avg Rating: ${candidate.avgRating}/5 from ${candidate.feedbackCount} reviews\n\n💡 **Strengths:** ${candidate.strengths.slice(0, 3).join(", ") || "Complete profile for insights"}\n⚠️ **Areas to Improve:** ${candidate.risks.slice(0, 3).join(", ") || "None significant"}`;
  }
  
  // Fraud/risk check
  if (lowerMsg.includes("risk") || lowerMsg.includes("fraud") || lowerMsg.includes("red flag")) {
    const risky = applicants.filter(a => a.risks.length > 0 && a.credScore < 50);
    if (risky.length === 0) return "No high-risk candidates identified at this time.";
    
    let response = "⚠️ **Candidates with Potential Risks:**\n\n";
    risky.slice(0, 5).forEach(c => {
      response += `• **${c.name}** (Score: ${c.credScore})\n`;
      response += `  Risks: ${c.risks.slice(0, 2).join(", ")}\n\n`;
    });
    return response;
  }
  
  // Help message
  return "🤖 **HireCred AI Assistant**\n\nI can help you with:\n\n• **Find top candidates** - \"Show me top performers\"\n• **Search for a candidate** - \"Tell me about John\"\n• **View stats** - \"How many applicants?\"\n• **Check risks** - \"Any red flags?\"\n• **Compare candidates** - \"Compare Sarah and Mike\"\n\nWhat would you like to know?";
}