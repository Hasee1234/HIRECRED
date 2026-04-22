import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

// GET messages/conversations for current user
export async function GET(request) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get all unique conversations for this user
    const messages = await Message.find({
      $or: [{ fromId: userId }, { toId: userId }],
    })
      .sort({ createdAt: -1 });
    
    // Group by conversation partner
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const partnerId = msg.fromId.toString() === userId ? msg.toId.toString() : msg.fromId.toString();
      
      if (!conversationsMap.has(partnerId)) {
        const partner = await User.findById(partnerId).select("name email role");
        conversationsMap.set(partnerId, {
          withUserId: partnerId,
          withUserName: partner?.name || "Unknown",
          withUserRole: partner?.role || "user",
          messages: [],
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
        });
      }
      
      const conv = conversationsMap.get(partnerId);
      conv.messages.push({
        id: msg._id,
        fromId: msg.fromId,
        toId: msg.toId,
        text: msg.text,
        createdAt: msg.createdAt,
        read: msg.read,
      });
      conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Update last message if this is newer
      if (new Date(msg.createdAt) > new Date(conv.lastMessageAt)) {
        conv.lastMessage = msg.text;
        conv.lastMessageAt = msg.createdAt;
      }
    }
    
    const conversations = Array.from(conversationsMap.values());
    
    // Sort by last message time (newest first)
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    
    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST send a new message
export async function POST(request) {
  try {
    await connectDB();
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { fromId, toId, text } = body;
    
    // Validate
    if (!fromId || !toId || !text) {
      return NextResponse.json(
        { error: "From ID, To ID, and text are required" },
        { status: 400 }
      );
    }
    
    if (fromId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: "Message text cannot be empty" },
        { status: 400 }
      );
    }
    
    // Create message
    const message = await Message.create({
      fromId,
      toId,
      text: text.trim(),
      read: false,
    });
    
    // Populate sender info
    await message.populate("fromId", "name email");
    
    return NextResponse.json(
      {
        message: {
          id: message._id,
          fromId: message.fromId,
          toId: message.toId,
          text: message.text,
          createdAt: message.createdAt,
          read: message.read,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}