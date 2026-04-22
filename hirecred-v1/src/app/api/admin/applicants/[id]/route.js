import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Feedback from "@/models/Feedback";
import { getCurrentUser } from "@/lib/auth";

// GET single applicant details (admin only)
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    
    // Get user
    const user = await User.findById(id).select("-password");
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }
    
    // Get profile
    const profile = await Profile.findOne({ userId: id });
    
    // Get feedbacks
    const feedbacks = await Feedback.find({ toUserId: id })
      .populate("fromClientId", "name email")
      .sort({ createdAt: -1 });
    
    const applicant = {
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
      feedbacks: feedbacks,
    };
    
    return NextResponse.json({ applicant }, { status: 200 });
  } catch (error) {
    console.error("Admin applicant fetch error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// UPDATE applicant review status (admin only)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    const body = await request.json();
    const { reviewStatus, reviewNote } = body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId: id },
      { 
        reviewed: true,
        reviewStatus: reviewStatus,
        reviewNote: reviewNote || "",
      },
      { new: true }
    );
    
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (error) {
    console.error("Admin review update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}