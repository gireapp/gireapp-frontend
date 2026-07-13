import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import type { JwtPayload } from '@gireapp/shared';
import { JWT_SECRET } from '@/lib/auth-secret';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

// Dashboard segments gated by academic level
const LEVEL_SEGMENTS = ['secondary', 'tertiary', 'professional'] as const;

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

  let session: JwtPayload | null = null;
  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      session = payload as unknown as JwtPayload;
    } catch (err) {
      // Token is invalid/expired
      session = null;
    }
  }

  // Redirect unauthenticated users trying to access private routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', pathname);
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
    // Onboarding must be completed before any dashboard route is reachable
    if (!session.isOnboardingComplete) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Users may only access the dashboard segment matching their academic level;
    // /dashboard root re-routes them to the correct segment.
    for (const segment of LEVEL_SEGMENTS) {
      if (
        pathname.startsWith(`/dashboard/${segment}`) &&
        session.academicLevel?.toLowerCase() !== segment
      ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  // Attach session data to headers for Server Components to consume easily
  const requestHeaders = new Headers(request.headers);
  if (session) {
    requestHeaders.set('x-user-id', session.userId);
    requestHeaders.set('x-user-role', session.role);
    requestHeaders.set('x-user-level', session.academicLevel ?? '');
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
