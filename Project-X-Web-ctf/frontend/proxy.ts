import { NextResponse, NextRequest } from 'next/server';

export default function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/ctf');
  const isAuthRoute = ['/login', '/register', '/'].includes(pathname);

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// 👇 Apply middleware to these routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ctf/:path*',
    '/',
  ],
};
