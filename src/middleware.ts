import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import type { JwtPayload } from "@gireapp/shared";
import { JWT_SECRET } from "@/lib/auth-secret";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  // Both are reached by a signed-out user: /verify-email from the emailed link,
  // /check-email straight after registering (no session exists until verified).
  "/verify-email",
  "/check-email",
  // Opened by a guardian, who has no GIREAPP account or session at all.
  "/guardian-consent",
  // Opened from the link sent to a new address during an email change.
  "/confirm-email-change",
];

// Public routes a signed-in user may also open, so they are not bounced to the
// dashboard: the landing page, and the email-change link — which is normally
// opened in the very browser that asked for the change.
const sessionAgnosticRoutes = ["/", "/confirm-email-change"];

// Dashboard segments gated by academic level
const LEVEL_SEGMENTS = ["secondary", "tertiary", "professional"] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude static files, Next.js internals, and api routes (if any remain)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const token = request.cookies.get("token")?.value;

  let session: JwtPayload | null = null;
  if (token) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      session = payload as unknown as JwtPayload;
    } catch {
      // Token is invalid/expired
      session = null;
    }
  }

  // Redirect unauthenticated users trying to access private routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    // Check if it's an expired token rather than just missing
    if (token) redirectUrl.searchParams.set("expired", "true");
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from public auth routes
  if (session && isPublicRoute && !sessionAgnosticRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Segment / Role based routing enforcement
  if (session && pathname.startsWith("/dashboard")) {
    // Onboarding must be completed before any dashboard route is reachable
    if (!session.isOnboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // /dashboard is a bare entry point with no UI of its own. Resolving it here
    // rather than in a page keeps it an HTTP redirect — a Server Component
    // redirect() serialises into the RSC payload and renders a blank document.
    if (pathname === "/dashboard") {
      const segment = session.academicLevel?.toLowerCase();
      const target =
        segment &&
        LEVEL_SEGMENTS.includes(segment as (typeof LEVEL_SEGMENTS)[number])
          ? `/dashboard/${segment}`
          : "/onboarding";
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Users may only access the dashboard segment matching their academic level.
    for (const segment of LEVEL_SEGMENTS) {
      if (
        pathname.startsWith(`/dashboard/${segment}`) &&
        session.academicLevel?.toLowerCase() !== segment
      ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Attach session data to headers for Server Components to consume easily
  const requestHeaders = new Headers(request.headers);
  if (session) {
    requestHeaders.set("x-user-id", session.userId);
    requestHeaders.set("x-user-role", session.role);
    requestHeaders.set("x-user-level", session.academicLevel ?? "");
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
