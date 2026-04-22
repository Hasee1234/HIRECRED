import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Set token in cookie
export async function setTokenCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set("hirecred_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Get token from cookie
export async function getTokenFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hirecred_token");
  return token ? token.value : null;
}

// Remove token cookie (logout)
export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("hirecred_token");
}

// Get current user from cookie
export async function getCurrentUser() {
  const token = await getTokenFromCookie();
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded;
}