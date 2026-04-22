import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Profile from "@/models/Profile";
// import { generateToken, setTokenCookie } from "../../../../../lib/auth";
import { generateToken, setTokenCookie } from "@/lib/auth";


export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "user",
    });

    // Create empty profile for user
    await Profile.create({
      userId: user._id,
      bio: "",
      skills: [],
      experience: [],
      portfolio: [],
    });

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set cookie
    await setTokenCookie(token);

    // At the end of your POST function, update the response:
return NextResponse.json(
  {
    message: "Account created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  },
  { status: 201 }
);
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}