import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { getCurrentUser } from "@/lib/auth";

// GET all applicants (admin only)
export async function GET(request) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get all users with role "user"
    const users = await User.find({ role: "user", isActive: true })
      .select("-password")
      .sort({ createdAt: -1 });
    
    // Get profiles for all users
    const applicants = [];
    
    for (const user of users) {
      const profile = await Profile.findOne({ userId: user._id });
      
      applicants.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        bio: profile?.bio || "",
        skills: profile?.skills || [],
        experience: profile?.experience || [],
        portfolio: profile?.portfolio || [],
        proofSignals: profile?.proofSignals || {},
        credScore: profile?.credScore || { score: 0, strengths: [], risks: [] },
        ratings: profile?.ratings || { skill: 0, communication: 0, reliability: 0, totalFeedbacks: 0 },
        resumeUrl: profile?.resumeUrl || "",
        reviewed: profile?.reviewed || false,
        reviewStatus: profile?.reviewStatus || "",
        reviewNote: profile?.reviewNote || "",
        lastActive: user.updatedAt,
      });
    }
    
    return NextResponse.json({ applicants }, { status: 200 });
  } catch (error) {
    console.error("Admin applicants fetch error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}