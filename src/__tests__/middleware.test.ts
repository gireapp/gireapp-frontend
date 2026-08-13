import { describe, it, expect, beforeAll, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";

const TEST_SECRET = "middleware-spec-secret";
const SECRET_BYTES = new TextEncoder().encode(TEST_SECRET);
const ORIGIN = "https://app.gireapp.test";

type Middleware = typeof import("@/middleware").middleware;
let middleware: Middleware;

beforeAll(async () => {
  // auth-secret.ts reads AUTH_SECRET at import time; stub before loading.
  vi.stubEnv("AUTH_SECRET", TEST_SECRET);
  vi.resetModules();
  ({ middleware } = await import("@/middleware"));
});

type SessionOverrides = {
  userId?: string;
  role?: string;
  academicLevel?: string | null;
  isOnboardingComplete?: boolean;
  expiresIn?: string;
};

async function signToken(overrides: SessionOverrides = {}): Promise<string> {
  const {
    userId = "user-1",
    role = "STUDENT",
    academicLevel = "SECONDARY",
    isOnboardingComplete = true,
    expiresIn = "1h",
  } = overrides;

  return new SignJWT({ userId, role, academicLevel, isOnboardingComplete })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_BYTES);
}

function request(pathname: string, token?: string): NextRequest {
  const headers = new Headers();
  if (token) headers.set("cookie", `token=${token}`);
  return new NextRequest(new URL(pathname, ORIGIN), { headers });
}

function redirectTarget(response: Response): URL | null {
  const location = response.headers.get("location");
  return location ? new URL(location) : null;
}

function isPassThrough(response: Response): boolean {
  return response.headers.get("x-middleware-next") === "1";
}

describe("middleware — non-page requests", () => {
  it.each(["/_next/static/chunk.js", "/api/health", "/logo.svg"])(
    "passes %s straight through",
    async (pathname) => {
      const response = await middleware(request(pathname));
      expect(isPassThrough(response)).toBe(true);
    },
  );
});

describe("middleware — unauthenticated visitors", () => {
  it.each(["/", "/login", "/register", "/forgot-password", "/reset-password"])(
    "allows the public route %s",
    async (pathname) => {
      const response = await middleware(request(pathname));
      expect(isPassThrough(response)).toBe(true);
    },
  );

  it("redirects a private route to login and preserves the callback url", async () => {
    const response = await middleware(request("/dashboard/courses"));
    const target = redirectTarget(response);

    expect(target?.pathname).toBe("/login");
    expect(target?.searchParams.get("callbackUrl")).toBe("/dashboard/courses");
  });

  it("does not flag a missing token as expired", async () => {
    const response = await middleware(request("/dashboard"));
    expect(redirectTarget(response)?.searchParams.has("expired")).toBe(false);
  });

  it("flags an unverifiable token as expired so the UI can explain itself", async () => {
    const response = await middleware(request("/dashboard", "not-a-real-jwt"));
    const target = redirectTarget(response);

    expect(target?.pathname).toBe("/login");
    expect(target?.searchParams.get("expired")).toBe("true");
  });

  it("treats a token signed with the wrong secret as unauthenticated", async () => {
    const foreign = await new SignJWT({ userId: "attacker", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("some-other-secret"));

    const response = await middleware(request("/dashboard", foreign));

    expect(redirectTarget(response)?.pathname).toBe("/login");
  });

  it("treats an expired token as unauthenticated", async () => {
    const expired = await new SignJWT({ userId: "user-1", role: "STUDENT" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(SECRET_BYTES);

    const response = await middleware(request("/dashboard", expired));

    expect(redirectTarget(response)?.pathname).toBe("/login");
  });
});

describe("middleware — authenticated visitors on public routes", () => {
  it.each(["/login", "/register", "/forgot-password"])(
    "sends them from %s to the dashboard",
    async (pathname) => {
      const response = await middleware(request(pathname, await signToken()));
      expect(redirectTarget(response)?.pathname).toBe("/dashboard");
    },
  );

  it("leaves the landing page reachable", async () => {
    const response = await middleware(request("/", await signToken()));
    expect(isPassThrough(response)).toBe(true);
  });
});

describe("middleware — onboarding gate", () => {
  it("diverts to onboarding when it is incomplete", async () => {
    const token = await signToken({ isOnboardingComplete: false });
    const response = await middleware(request("/dashboard", token));

    expect(redirectTarget(response)?.pathname).toBe("/onboarding");
  });

  it("lets an onboarded user reach their segment dashboard", async () => {
    const response = await middleware(
      request("/dashboard/secondary", await signToken()),
    );
    expect(isPassThrough(response)).toBe(true);
  });
});

describe("middleware — /dashboard entry point", () => {
  // /dashboard has no page of its own: a Server Component redirect() there
  // serialises into the RSC payload and renders a blank document.
  it.each([
    ["SECONDARY", "/dashboard/secondary"],
    ["TERTIARY", "/dashboard/tertiary"],
    ["PROFESSIONAL", "/dashboard/professional"],
  ])("routes a %s learner to %s", async (academicLevel, expected) => {
    const response = await middleware(
      request("/dashboard", await signToken({ academicLevel })),
    );

    expect(redirectTarget(response)?.pathname).toBe(expected);
  });

  it("sends a learner with no academic level to onboarding", async () => {
    const token = await signToken({
      academicLevel: null,
      isOnboardingComplete: true,
    });
    const response = await middleware(request("/dashboard", token));

    expect(redirectTarget(response)?.pathname).toBe("/onboarding");
  });
});

describe("middleware — academic level segment enforcement", () => {
  it("allows the segment matching the user's level", async () => {
    const token = await signToken({ academicLevel: "SECONDARY" });
    const response = await middleware(request("/dashboard/secondary", token));

    expect(isPassThrough(response)).toBe(true);
  });

  it.each([
    ["SECONDARY", "/dashboard/tertiary"],
    ["SECONDARY", "/dashboard/professional"],
    ["TERTIARY", "/dashboard/secondary"],
    ["PROFESSIONAL", "/dashboard/secondary"],
  ])("bounces a %s user away from %s", async (level, pathname) => {
    const token = await signToken({ academicLevel: level });
    const response = await middleware(request(pathname, token));

    expect(redirectTarget(response)?.pathname).toBe("/dashboard");
  });

  it("bounces a user whose level is unset", async () => {
    const token = await signToken({ academicLevel: null });
    const response = await middleware(request("/dashboard/secondary", token));

    expect(redirectTarget(response)?.pathname).toBe("/dashboard");
  });

  it("leaves non-segment dashboard routes alone", async () => {
    const token = await signToken({ academicLevel: "SECONDARY" });
    const response = await middleware(request("/dashboard/courses", token));

    expect(isPassThrough(response)).toBe(true);
  });
});

describe("middleware — session headers for server components", () => {
  it("injects user id, role and level", async () => {
    const token = await signToken({
      userId: "user-42",
      role: "MENTOR",
      academicLevel: "TERTIARY",
    });
    const response = await middleware(request("/dashboard/tertiary", token));

    expect(response.headers.get("x-middleware-request-x-user-id")).toBe(
      "user-42",
    );
    expect(response.headers.get("x-middleware-request-x-user-role")).toBe(
      "MENTOR",
    );
    expect(response.headers.get("x-middleware-request-x-user-level")).toBe(
      "TERTIARY",
    );
  });

  it("sends an empty level rather than omitting the header when unset", async () => {
    const token = await signToken({ academicLevel: null });
    const response = await middleware(request("/", token));

    expect(response.headers.get("x-middleware-request-x-user-level")).toBe("");
  });

  it("injects nothing for anonymous visitors", async () => {
    const response = await middleware(request("/"));
    expect(response.headers.get("x-middleware-request-x-user-id")).toBeNull();
  });
});
