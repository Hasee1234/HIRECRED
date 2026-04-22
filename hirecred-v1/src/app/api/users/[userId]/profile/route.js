import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
import { getCurrentUser } from "@/lib/auth";

// GET user profile
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { userId } = params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const profile = await Profile.findOne({ userId }).populate("userId", "name email");
    
    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }
    
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// UPDATE user profile
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { userId } = params;
    const body = await request.json();
    
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.id !== userId && currentUser.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { ...body },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}