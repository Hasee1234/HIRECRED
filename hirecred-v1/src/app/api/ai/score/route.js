import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
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
        maxOutputTokens: 2000,
      },
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    console.error("Gemini API error:", data.error);
    throw new Error(data.error.message || "AI service error");
  }
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  // Try to parse JSON from response
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonStr);
  } catch (e) {
    // If parsing fails, return default structure
    console.error("Failed to parse AI response:", text);
    return {
      credibility_score: 50,
      strengths: ["Unable to analyze properly"],
      risks: ["Please try again or add more profile information"],
    };
  }
}

// Generate credibility score prompt
function generateScorePrompt(profile, user) {
  return `You are an AI hiring assistant. Analyze this candidate's profile and provide a credibility score from 0-100.

CANDIDATE PROFILE:
Name: ${user.name}
Bio: ${profile.bio || "Not provided"}

SKILLS:
${profile.skills?.map(s => `- ${s.name} (${s.level})`).join("\n") || "No skills listed"}

EXPERIENCE:
${profile.experience?.map(e => `- ${e.role} at ${e.company} (${e.years} years) - ${e.description || ""}`).join("\n") || "No experience listed"}

PORTFOLIO:
${profile.portfolio?.map(p => `- ${p.title}: ${p.url || ""} - ${p.description || ""}`).join("\n") || "No portfolio items"}

PROOF SIGNALS:
- GitHub: ${profile.proofSignals?.githubUrl || "Not provided"}
- LinkedIn: ${profile.proofSignals?.linkedinUrl || "Not provided"}
- Client References: ${profile.proofSignals?.clientReferences?.length || 0} provided

EXISTING RATINGS (from client feedback):
- Skill Rating: ${profile.ratings?.skill || 0}/5
- Communication: ${profile.ratings?.communication || 0}/5
- Reliability: ${profile.ratings?.reliability || 0}/5

Return ONLY valid JSON in this exact format:
{
  "credibility_score": number (0-100),
  "strengths": ["string", "string", "string"],
  "risks": ["string", "string", "string"]
}

Consider: skills relevance, experience quality, portfolio completeness, proof signals (GitHub/LinkedIn add +10 each), client references add +5 each, and existing ratings.`;
}

export async function POST(request) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { userId } = body;
    
    // Check authorization
    if (userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user and profile
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    
    // Check if we have Gemini API key
    if (!GEMINI_API_KEY) {
      // Fallback: Calculate score locally
      const fallbackScore = calculateFallbackScore(profile);
      return NextResponse.json({ credScore: fallbackScore }, { status: 200 });
    }
    
    // Generate AI score
    const prompt = generateScorePrompt(profile, user);
    const aiResult = await callGemini(prompt);
    
    // Update profile with new score
    const credScore = {
      score: aiResult.credibility_score || 50,
      strengths: aiResult.strengths || [],
      risks: aiResult.risks || [],
      lastUpdated: new Date(),
    };
    
    await Profile.findOneAndUpdate(
      { userId },
      { credScore },
      { new: true }
    );
    
    return NextResponse.json({ credScore }, { status: 200 });
  } catch (error) {
    console.error("AI score generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate score" },
      { status: 500 }
    );
  }
}

// Fallback scoring without AI
function calculateFallbackScore(profile) {
  let score = 30; // Base score
  
  // Bio (max +10)
  if (profile.bio?.length > 100) score += 10;
  else if (profile.bio?.length > 50) score += 5;
  
  // Skills (max +15)
  const skillCount = profile.skills?.length || 0;
  score += Math.min(skillCount * 3, 15);
  
  // Experience (max +20)
  const totalYears = profile.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0;
  score += Math.min(totalYears * 2, 20);
  
  // Portfolio (max +10)
  const portfolioCount = profile.portfolio?.length || 0;
  score += Math.min(portfolioCount * 3, 10);
  
  // Proof signals (max +15)
  if (profile.proofSignals?.githubUrl) score += 5;
  if (profile.proofSignals?.linkedinUrl) score += 5;
  const refCount = profile.proofSignals?.clientReferences?.length || 0;
  score += Math.min(refCount * 2, 10);
  
  // Existing ratings (max +15)
  const avgRating = ((profile.ratings?.skill || 0) + 
                     (profile.ratings?.communication || 0) + 
                     (profile.ratings?.reliability || 0)) / 3;
  score += avgRating * 3;
  
  // Generate strengths and risks based on data
  const strengths = [];
  const risks = [];
  
  if (skillCount >= 3) strengths.push("Has diverse skill set");
  if (totalYears >= 3) strengths.push(`${totalYears}+ years of experience`);
  if (portfolioCount >= 2) strengths.push("Strong portfolio with multiple projects");
  if (profile.proofSignals?.githubUrl) strengths.push("Active GitHub presence");
  if (avgRating >= 4) strengths.push("Excellent client feedback");
  
  if (skillCount === 0) risks.push("No skills listed");
  if (totalYears === 0) risks.push("No work experience documented");
  if (portfolioCount === 0) risks.push("No portfolio projects shown");
  if (!profile.proofSignals?.githubUrl && !profile.proofSignals?.linkedinUrl) risks.push("Missing professional social links");
  if (avgRating < 3 && profile.ratings?.totalFeedbacks > 0) risks.push("Below average client ratings");
  
  return {
    score: Math.min(score, 100),
    strengths: strengths.length ? strengths : ["Profile is being built"],
    risks: risks.length ? risks : ["Complete your profile for better insights"],
    lastUpdated: new Date(),
  };
}