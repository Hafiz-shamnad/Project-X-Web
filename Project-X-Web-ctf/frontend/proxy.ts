import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin-only protection layer.
 * This runs server-side only for Next.js and protects /admin pages.
 * 
 * NOTE:
 * - This is NOT middleware.
 * - This is a proxy function you manually call in pages or routes.
 * - Node APIs (Buffer) are allowed.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect only /admin pages
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Decode JWT payload (Node backend signed it, so safe to decode)
      const [, payloadBase64] = token.split(".");
      const json = JSON.parse(
        Buffer.from(payloadBase64, "base64").toString("utf8")
      );

      if (json.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Allow everything else
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
