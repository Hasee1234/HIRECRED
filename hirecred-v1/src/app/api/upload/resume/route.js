import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Profile from "@/models/Profile";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Helper function to generate unique filename
function generateFilename(originalName, userId) {
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}_${timestamp}_${safeName}`;
}

export async function POST(request) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get("resume");
    const userId = formData.get("userId");
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    // Validate user
    if (userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and Word documents are allowed" },
        { status: 400 }
      );
    }
    
    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename and save file
    const filename = generateFilename(file.name, userId);
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Save file URL to profile
    const resumeUrl = `/uploads/resumes/${filename}`;
    
    await Profile.findOneAndUpdate(
      { userId },
      { resumeUrl },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(
      { message: "Resume uploaded successfully", resumeUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}