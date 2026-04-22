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
        temperature: 0.5,
        maxOutputTokens: 1000,
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
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    return {
      skillRating: 3,
      communicationRating: 3,
      reliabilityRating: 3,
      summary: "Feedback analyzed successfully.",
    };
  }
}

// Generate feedback analysis prompt
function generateFeedbackPrompt(feedbackText, projectTitle) {
  return `You are an AI that analyzes client feedback for freelancers/candidates. Analyze the following feedback and extract ratings.

PROJECT/CONTEXT: ${projectTitle || "General freelance work"}

CLIENT FEEDBACK:
"${feedbackText}"

Rate the candidate on a scale of 1-5 for each category:
- Skill Rating: Technical ability and expertise
- Communication Rating: Responsiveness, clarity, professionalism  
- Reliability Rating: Meeting deadlines, dependability, follow-through

Also provide a 1-sentence summary of the feedback.

Return ONLY valid JSON in this exact format:
{
  "skillRating": number (1-5),
  "communicationRating": number (1-5),
  "reliabilityRating": number (1-5),
  "summary": "string (max 100 chars)"
}

Important: Be objective. If feedback is positive, give higher ratings. If negative, give lower ratings.`;
}

// Update user's average ratings
async function updateAverageRatings(userId) {
  const allFeedbacks = await Feedback.find({ 
    toUserId: userId, 
    isProcessed: true 
  });
  
  let totalSkill = 0;
  let totalComm = 0;
  let totalRel = 0;
  let count = 0;
  
  for (const fb of allFeedbacks) {
    if (fb.aiProcessed) {
      totalSkill += fb.aiProcessed.skillRating || 0;
      totalComm += fb.aiProcessed.communicationRating || 0;
      totalRel += fb.aiProcessed.reliabilityRating || 0;
      count++;
    }
  }
  
  const ratings = {
    skill: count > 0 ? Number((totalSkill / count).toFixed(1)) : 0,
    communication: count > 0 ? Number((totalComm / count).toFixed(1)) : 0,
    reliability: count > 0 ? Number((totalRel / count).toFixed(1)) : 0,
    totalFeedbacks: count,
  };
  
  await Profile.findOneAndUpdate(
    { userId },
    { ratings },
    { new: true }
  );
  
  return ratings;
}

export async function POST(request) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
    }
    
    const body = await request.json();
    const { userId, feedbackText, projectTitle } = body;
    
    if (!userId || !feedbackText) {
      return NextResponse.json(
        { error: "User ID and feedback text are required" },
        { status: 400 }
      );
    }
    
    if (feedbackText.length < 10) {
      return NextResponse.json(
        { error: "Feedback must be at least 10 characters" },
        { status: 400 }
      );
    }
    
    // Get user to ensure exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    let aiResult;
    
    // Use AI if API key exists, otherwise fallback
    if (GEMINI_API_KEY) {
      const prompt = generateFeedbackPrompt(feedbackText, projectTitle);
      aiResult = await callGemini(prompt);
    } else {
      // Fallback: Simple keyword-based analysis
      const lowerText = feedbackText.toLowerCase();
      aiResult = {
        skillRating: calculateFallbackRating(lowerText, ["skill", "technical", "code", "expert", "knowledge"]),
        communicationRating: calculateFallbackRating(lowerText, ["communication", "responsive", "clear", "update", "question"]),
        reliabilityRating: calculateFallbackRating(lowerText, ["deadline", "reliable", "on time", "punctual", "commitment"]),
        summary: feedbackText.slice(0, 100) + (feedbackText.length > 100 ? "..." : ""),
      };
    }
    
    // Save feedback to database
    const feedback = await Feedback.create({
      fromClientId: currentUser.id,
      toUserId: userId,
      rawText: feedbackText,
      aiProcessed: {
        skillRating: aiResult.skillRating,
        communicationRating: aiResult.communicationRating,
        reliabilityRating: aiResult.reliabilityRating,
        summary: aiResult.summary,
      },
      isProcessed: true,
      projectTitle: projectTitle || "",
    });
    
    // Update user's average ratings
    const updatedRatings = await updateAverageRatings(userId);
    
    return NextResponse.json(
      {
        message: "Feedback processed successfully",
        feedback: {
          id: feedback._id,
          skillRating: aiResult.skillRating,
          communicationRating: aiResult.communicationRating,
          reliabilityRating: aiResult.reliabilityRating,
          summary: aiResult.summary,
        },
        updatedRatings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Feedback analysis error:", error);
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    );
  }
}

// Fallback rating calculation based on keywords
function calculateFallbackRating(text, positiveKeywords) {
  let score = 3; // neutral start
  
  for (const keyword of positiveKeywords) {
    if (text.includes(keyword)) {
      score += 0.5;
    }
  }
  
  // Check for negative words
  const negativeWords = ["bad", "poor", "terrible", "awful", "disappointed", "late", "missed"];
  for (const word of negativeWords) {
    if (text.includes(word)) {
      score -= 0.5;
    }
  }
  
  // Check for strong positive words
  const strongPositive = ["excellent", "amazing", "outstanding", "perfect", "brilliant"];
  for (const word of strongPositive) {
    if (text.includes(word)) {
      score += 0.5;
    }
  }
  
  return Math.min(5, Math.max(1, Math.round(score)));
}