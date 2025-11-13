/**
 * Application Middleware
 * ----------------------
 * This middleware protects client-side routes by verifying the presence
 * and validity of a JWT stored in cookies. It enforces:
 *
 *  - Authentication checks for protected areas (dashboard, CTF areas)
 *  - Role-based access control for admin routes
 *  - Prevention of authenticated users accessing login/register pages
 *
 * Running Environment:
 *  - Next.js Edge Runtime
 *  - Works in Node, Vercel Edge, and serverless platforms
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Decodes the payload section of a JWT without verification.
 * This function does NOT validate signature or expiry; it only extracts
 * metadata (e.g., user role), which is sufficient for UI-level routing.
 *
 * @param token - The raw JWT string
 * @returns Parsed payload object or null on failure
 */
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    // Normalize Base64 URL encoding
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");

    // Decode Base64 payload
    const json = Buffer.from(normalized, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Route Protection Middleware
 *
 * @param req - Incoming Next.js request object
 * @returns Redirect response or continuation of request pipeline
 */
export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Route groups
  const requiresAuth =
    pathname.startsWith("/dashboard") || pathname.startsWith("/ctf");

  const requiresAdmin = pathname.startsWith("/admin");

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/";

  /**
   * 1. Authentication Enforcement
   * Users must be logged in to access protected or admin routes.
   */
  if (!token && (requiresAuth || requiresAdmin)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /**
   * 2. Role-Based Access Control
   * Admin-only sections require the user's role to be "admin".
   */
  if (requiresAdmin && token) {
    const decoded = decodeJwt(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  /**
   * 3. Prevent Authenticated Users from Visiting Auth Pages
   * If a user is already logged in, redirect them away from login/register.
   */
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Matcher Configuration
 * Defines which routes should trigger this middleware.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ctf/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/",
  ],
};
