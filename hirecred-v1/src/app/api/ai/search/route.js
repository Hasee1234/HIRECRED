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
        temperature: 0.3,
        maxOutputTokens: 3000,
      },
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    console.error("Gemini API error:", data.error);
    throw new Error(data.error.message || "AI service error");
  }
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[\{[\s\S]*\}\]/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    return [];
  }
}

// Generate search prompt
function generateSearchPrompt(query, candidates, filters) {
  const candidatesData = candidates.map(c => ({
    id: c._id,
    name: c.name,
    skills: c.skills?.map(s => s.name) || [],
    experience: c.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0,
    bio: c.bio || "",
    credScore: c.credScore?.score || 0,
    avgRating: c.ratings ? ((c.ratings.skill + c.ratings.communication + c.ratings.reliability) / 3).toFixed(1) : 0,
    hasGithub: !!c.proofSignals?.githubUrl,
    hasLinkedin: !!c.proofSignals?.linkedinUrl,
    references: c.proofSignals?.clientReferences?.length || 0,
  }));
  
  return `You are an AI hiring assistant. Given a search query and a list of candidates, rank the candidates by relevance.

SEARCH QUERY: "${query}"

FILTERS APPLIED:
- Min Credibility Score: ${filters.minScore || 0}
- Min Experience: ${filters.minExperience || 0} years
- Required Skills: ${filters.skills?.length ? filters.skills.join(", ") : "None"}

CANDIDATES (${candidates.length} total):
${JSON.stringify(candidatesData, null, 2)}

Return a JSON array of the most relevant candidate IDs in order, with match reasons.
Format:
[
  {
    "id": "candidate_id",
    "relevanceScore": number (0-100),
    "matchReason": "brief explanation why this candidate matches",
    "matchedSkills": ["skill1", "skill2"]
  }
]

Return ONLY the top 10 most relevant candidates. Consider:
- Skills matching the query
- Experience level
- Credibility score
- Portfolio/proof signals
- Overall rating from feedback

Be objective and data-driven.`;
}

// Fallback search without AI
function fallbackSearch(query, candidates, filters) {
  const lowerQuery = query.toLowerCase();
  
  const scored = candidates.map(candidate => {
    let score = 0;
    const matchedSkills = [];
    
    // Check skills match
    const skills = candidate.skills?.map(s => s.name.toLowerCase()) || [];
    for (const skill of skills) {
      if (lowerQuery.includes(skill)) {
        score += 15;
        matchedSkills.push(skill);
      }
    }
    
    // Experience match
    const expYears = candidate.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0;
    if (lowerQuery.includes(`${expYears}+`) || (expYears >= 3 && lowerQuery.includes("senior"))) {
      score += 10;
    }
    if (expYears >= filters.minExperience) score += 5;
    
    // Score based on credibility
    score += (candidate.credScore?.score || 0) * 0.5;
    
    // Rating boost
    const avgRating = candidate.ratings ? ((candidate.ratings.skill + candidate.ratings.communication + candidate.ratings.reliability) / 3) : 0;
    score += avgRating * 5;
    
    // Proof signals boost
    if (candidate.proofSignals?.githubUrl) score += 5;
    if (candidate.proofSignals?.linkedinUrl) score += 5;
    score += (candidate.proofSignals?.clientReferences?.length || 0) * 3;
    
    // Bio match
    if (candidate.bio?.toLowerCase().includes(lowerQuery)) score += 10;
    
    return {
      ...candidate,
      relevanceScore: Math.min(100, Math.round(score)),
      matchReason: `Matched ${matchedSkills.length} skills and has ${expYears} years of experience`,
      matchedSkills: matchedSkills.slice(0, 3),
    };
  });
  
  return scored
    .filter(c => c.relevanceScore > 20)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);
}

export async function POST(request) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }
    
    const body = await request.json();
    const { query, filters = {} } = body;
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }
    
    // Get all candidates
    const users = await User.find({ role: "user", isActive: true }).select("-password");
    
    const candidates = [];
    for (const user of users) {
      const profile = await Profile.findOne({ userId: user._id });
      if (profile) {
        candidates.push({
          _id: user._id,
          name: user.name,
          email: user.email,
          bio: profile.bio || "",
          skills: profile.skills || [],
          experience: profile.experience || [],
          portfolio: profile.portfolio || [],
          proofSignals: profile.proofSignals || {},
          credScore: profile.credScore || { score: 0 },
          ratings: profile.ratings || { skill: 0, communication: 0, reliability: 0 },
        });
      }
    }
    
    // Apply filters first
    let filteredCandidates = candidates;
    
    if (filters.minScore > 0) {
      filteredCandidates = filteredCandidates.filter(c => (c.credScore?.score || 0) >= filters.minScore);
    }
    
    if (filters.minExperience > 0) {
      filteredCandidates = filteredCandidates.filter(c => {
        const totalExp = c.experience?.reduce((sum, e) => sum + (e.years || 0), 0) || 0;
        return totalExp >= filters.minExperience;
      });
    }
    
    if (filters.skills?.length > 0) {
      filteredCandidates = filteredCandidates.filter(c => {
        const candidateSkills = c.skills?.map(s => s.name.toLowerCase()) || [];
        return filters.skills.some(skill => 
          candidateSkills.includes(skill.toLowerCase())
        );
      });
    }
    
    if (filteredCandidates.length === 0) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }
    
    let results;
    
    // Use AI if API key exists and enough candidates
    if (GEMINI_API_KEY && filteredCandidates.length <= 50) {
      try {
        const prompt = generateSearchPrompt(query, filteredCandidates, filters);
        const aiResults = await callGemini(prompt);
        
        // Map AI results back to full candidate objects
        results = aiResults.map(aiResult => {
          const candidate = filteredCandidates.find(c => c._id.toString() === aiResult.id);
          if (candidate) {
            return {
              ...candidate,
              relevanceScore: aiResult.relevanceScore || 50,
              matchReason: aiResult.matchReason || "Matches your search criteria",
              matchedSkills: aiResult.matchedSkills || [],
            };
          }
          return null;
        }).filter(r => r !== null);
      } catch (aiError) {
        console.error("AI search failed, using fallback:", aiError);
        results = fallbackSearch(query, filteredCandidates, filters);
      }
    } else {
      results = fallbackSearch(query, filteredCandidates, filters);
    }
    
    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}