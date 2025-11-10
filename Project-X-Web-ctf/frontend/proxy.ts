import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ small helper: decode base64 safely in Edge runtime
function decodeJwtPayload(token: string) {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/ctf');
  const isAdmin = pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/register', '/'].includes(pathname);

  if (!token && (isProtected || isAdmin)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAdmin && token) {
    const decoded = decodeJwtPayload(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/ctf/:path*', '/login', '/register', '/', '/admin/:path*'],
};
