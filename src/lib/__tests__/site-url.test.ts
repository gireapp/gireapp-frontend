import { describe, it, expect, afterEach, vi } from "vitest";
import { siteUrl } from "@/lib/site-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("siteUrl", () => {
  it("uses NEXT_PUBLIC_APP_URL when it is set", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.gireapp.com");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "gireapp.vercel.app");

    expect(siteUrl().origin).toBe("https://www.gireapp.com");
  });

  it("falls back to Vercel's production domain", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "www.gireapp.com");

    expect(siteUrl().origin).toBe("https://www.gireapp.com");
  });

  it("falls back to localhost in development", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");

    expect(siteUrl().origin).toBe("http://localhost:3000");
  });
});
