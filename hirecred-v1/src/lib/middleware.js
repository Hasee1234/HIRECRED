import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hirecred_super_secret_key_change_this_in_production"
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get("hirecred_token")?.value;

  // Define protected routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/user");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // If no token and trying to access protected route
  if (!token && (isAdminRoute || isUserRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // If logged in user tries to access auth pages redirect to dashboard
      if (isAuthRoute) {
        if (payload.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } else {
          return NextResponse.redirect(new URL("/user/dashboard", request.url));
        }
      }

      // If user tries to access admin routes
      if (isAdminRoute && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/user/dashboard", request.url));
      }

      // If admin tries to access user routes
      if (isUserRoute && payload.role !== "user") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Invalid token - clear it and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("hirecred_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/register",
  ],
};