import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * BEST PRACTICE:
 * Only protect /admin on server side.
 * Dashboard/CTF/Login handled by client-side with useUser().
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔐 Only protect /admin using cookie token (optional)
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;

    // If no cookie token → redirect
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Attempt decode for admin role (optional)
    try {
      const payload = token.split(".")[1];
      const json = JSON.parse(
        Buffer.from(payload, "base64").toString("utf-8")
      );

      if (json.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ⭐ Allow: dashboard, ctf, login, register, homepage
  return NextResponse.next();
}

/**
 * Apply proxy ONLY to admin path.
 */
export const config = {
  matcher: ["/admin/:path*"],
};
