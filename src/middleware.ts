import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('AUTH_SECRET environment variable is required in production');
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'fallback-dev-secret-change-me'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude static files, Next.js internals, and api routes (if any remain)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  const token = request.cookies.get('token')?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch (err) {
      // Token is invalid/expired
      session = null;
    }
  }

  // Redirect unauthenticated users trying to access private routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', encodeURI(pathname));
    // Check if it's an expired token rather than just missing
    if (token) redirectUrl.searchParams.set('expired', 'true');
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from public auth routes
  if (session && isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Segment / Role based routing enforcement
  if (session && pathname.startsWith('/dashboard')) {
    // If onboarding is incomplete, restrict access
    if (!session.isOnboardingComplete && !pathname.startsWith('/onboarding')) {
       // Assuming /onboarding is a route, if not, redirect to dashboard root which handles onboarding modal
    }

    // Secondary students should not access tertiary dashboard
    if (pathname.startsWith('/dashboard/tertiary') && session.academicLevel !== 'TERTIARY') {
      return NextResponse.redirect(new URL('/dashboard/secondary', request.url));
    }
    // Tertiary students should not access secondary dashboard
    if (pathname.startsWith('/dashboard/secondary') && session.academicLevel !== 'SECONDARY') {
      return NextResponse.redirect(new URL('/dashboard/tertiary', request.url));
    }
  }

  // Attach session data to headers for Server Components to consume easily
  const requestHeaders = new Headers(request.headers);
  if (session) {
    requestHeaders.set('x-user-id', session.userId as string);
    requestHeaders.set('x-user-role', session.role as string);
    requestHeaders.set('x-user-level', (session.academicLevel as string) || '');
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
