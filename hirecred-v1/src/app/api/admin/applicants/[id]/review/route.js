import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/models/Profile";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;
    const body = await request.json();
    const { status, note } = body;
    
    const profile = await Profile.findOneAndUpdate(
      { userId: id },
      { 
        reviewed: true,
        reviewStatus: status,
        reviewNote: note || "",
      },
      { new: true }
    );
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}