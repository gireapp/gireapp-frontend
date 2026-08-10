import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SignJWT } from "jose";

const TEST_SECRET = "session-spec-secret";
const SECRET_BYTES = new TextEncoder().encode(TEST_SECRET);

type CookieStore = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

let cookieStore: CookieStore;

/**
 * session.ts reads the secret at import time and pulls `cookies()` from
 * next/headers, so both are stubbed before each fresh module load.
 */
async function loadSession(nodeEnv = "test") {
  vi.resetModules();
  vi.stubEnv("AUTH_SECRET", TEST_SECRET);
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.doMock("next/headers", () => ({ cookies: async () => cookieStore }));
  return import("@/lib/session");
}

async function signToken(
  claims: Record<string, unknown>,
  expiresIn = "1h",
): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_BYTES);
}

beforeEach(() => {
  cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock("next/headers");
});

describe("getSession", () => {
  it("returns null when no token cookie is present", async () => {
    const { getSession } = await loadSession();
    cookieStore.get.mockReturnValue(undefined);

    expect(await getSession()).toBeNull();
  });

  it("returns the decoded payload for a valid token", async () => {
    const { getSession } = await loadSession();
    const token = await signToken({
      userId: "user-7",
      role: "STUDENT",
      academicLevel: "TERTIARY",
    });
    cookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();

    expect(session).toMatchObject({
      userId: "user-7",
      role: "STUDENT",
      academicLevel: "TERTIARY",
    });
  });

  it("reads specifically the `token` cookie", async () => {
    const { getSession } = await loadSession();
    cookieStore.get.mockReturnValue(undefined);

    await getSession();

    expect(cookieStore.get).toHaveBeenCalledWith("token");
  });

  it("returns null for a malformed token rather than throwing", async () => {
    const { getSession } = await loadSession();
    cookieStore.get.mockReturnValue({ value: "definitely-not-a-jwt" });

    await expect(getSession()).resolves.toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    const { getSession } = await loadSession();
    const foreign = await new SignJWT({ userId: "attacker" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("wrong-secret"));
    cookieStore.get.mockReturnValue({ value: foreign });

    await expect(getSession()).resolves.toBeNull();
  });

  it("returns null for an expired token", async () => {
    const { getSession } = await loadSession();
    const expired = await new SignJWT({ userId: "user-7" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(SECRET_BYTES);
    cookieStore.get.mockReturnValue({ value: expired });

    await expect(getSession()).resolves.toBeNull();
  });
});

describe("setSessionToken", () => {
  it("stores the token as an httpOnly, lax, root-scoped cookie", async () => {
    const { setSessionToken } = await loadSession();

    await setSessionToken("jwt-abc");

    expect(cookieStore.set).toHaveBeenCalledWith(
      "token",
      "jwt-abc",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      }),
    );
  });

  it("omits the secure flag outside production so local http works", async () => {
    const { setSessionToken } = await loadSession("development");

    await setSessionToken("jwt-abc");

    expect(cookieStore.set.mock.calls[0]?.[2]).toMatchObject({ secure: false });
  });

  it("sets the secure flag in production", async () => {
    const { setSessionToken } = await loadSession("production");

    await setSessionToken("jwt-abc");

    expect(cookieStore.set.mock.calls[0]?.[2]).toMatchObject({ secure: true });
  });
});

describe("clearSessionToken", () => {
  it("deletes the token cookie", async () => {
    const { clearSessionToken } = await loadSession();

    await clearSessionToken();

    expect(cookieStore.delete).toHaveBeenCalledWith("token");
  });
});
