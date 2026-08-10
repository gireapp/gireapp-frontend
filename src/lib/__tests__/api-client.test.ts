import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const API_BASE = "https://api.gireapp.test";

type ApiClientModule = typeof import("@/lib/api-client");

/**
 * The module captures NEXT_PUBLIC_API_URL at import time, so each load stubs the
 * env first and resets the module registry to force re-evaluation.
 */
async function loadApiClient(): Promise<ApiClientModule> {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", API_BASE);
  return import("@/lib/api-client");
}

function jsonResponse(body: unknown, init: { status?: number } = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("apiClient — success paths", () => {
  it("prefixes the API base and returns parsed JSON with the status", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({ id: "course-1" }));

    const result = await apiClient<{ id: string }>("/courses");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_BASE}/courses`);
    expect(result).toEqual({ data: { id: "course-1" }, status: 200 });
  });

  it("returns the raw text body when the response is not JSON", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(
      new Response("pong", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );

    const result = await apiClient<string>("/health");

    expect(result.data).toBe("pong");
  });

  it("always sends credentials so the session cookie travels with the request", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient("/me");

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });
});

describe("apiClient — headers", () => {
  function headersOf(call: unknown): Headers {
    return (call as [string, RequestInit])[1].headers as Headers;
  }

  it("defaults Content-Type to JSON when a body is present", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient("/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.c" }),
    });

    expect(headersOf(fetchMock.mock.calls[0]).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("does not override an explicit Content-Type", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient("/upload", {
      method: "POST",
      body: "raw",
      headers: { "Content-Type": "text/plain" },
    });

    expect(headersOf(fetchMock.mock.calls[0]).get("Content-Type")).toBe(
      "text/plain",
    );
  });

  it("omits Content-Type entirely for bodyless requests", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient("/courses");

    expect(headersOf(fetchMock.mock.calls[0]).has("Content-Type")).toBe(false);
  });

  it("forwards a supplied token as a cookie header", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient("/me", { token: "jwt-123" });

    expect(headersOf(fetchMock.mock.calls[0]).get("Cookie")).toBe(
      "token=jwt-123",
    );
  });

  it("sends no cookie header when there is no token", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient("/courses");

    expect(headersOf(fetchMock.mock.calls[0]).has("Cookie")).toBe(false);
  });
});

describe("apiClient — SSRF protection", () => {
  it("blocks a path that redirects the origin via userinfo, without calling fetch", async () => {
    const { apiClient } = await loadApiClient();

    // `${API_BASE}@evil.test` parses as user info on host evil.test.
    await expect(apiClient("@evil.test/steal")).rejects.toThrow(
      /SSRF Protection/,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an absolute URL to another origin without calling fetch", async () => {
    const { apiClient } = await loadApiClient();

    await expect(apiClient("https://evil.test/steal")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows protocol-relative-looking paths that stay on the API origin", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiClient("/courses?next=//evil.test");

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("apiClient — error responses", () => {
  it("throws ApiError carrying the status and the server message", async () => {
    const { apiClient, ApiError } = await loadApiClient();
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "Invalid credentials" }, { status: 401 }),
    );

    const error = await apiClient("/login").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      name: "ApiError",
      message: "Invalid credentials",
      status: 401,
    });
  });

  it("falls back to a generic message when the body carries none", async () => {
    const { apiClient } = await loadApiClient();
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 500 }));

    await expect(apiClient("/courses")).rejects.toThrow("API Error: 500");
  });
});

describe("ApiError", () => {
  it("flags 401 as unauthorized only", async () => {
    const { ApiError } = await loadApiClient();

    expect(new ApiError("nope", 401).isUnauthorized).toBe(true);
    expect(new ApiError("nope", 403).isUnauthorized).toBe(false);
  });

  it("flags 422 as a validation error only", async () => {
    const { ApiError } = await loadApiClient();

    expect(new ApiError("bad", 422).isValidationError).toBe(true);
    expect(new ApiError("bad", 400).isValidationError).toBe(false);
  });

  it("exposes field errors from the payload", async () => {
    const { ApiError } = await loadApiClient();
    const error = new ApiError("bad", 422, {
      errors: { email: ["Email is required"] },
    });

    expect(error.fieldErrors).toEqual({ email: ["Email is required"] });
  });

  it("returns undefined field errors when the payload has none", async () => {
    const { ApiError } = await loadApiClient();

    expect(new ApiError("bad", 422).fieldErrors).toBeUndefined();
    expect(new ApiError("bad", 422, {}).fieldErrors).toBeUndefined();
  });
});

describe("serverApiClient", () => {
  it("reads the token cookie and forwards it to apiClient", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_BASE);
    vi.doMock("next/headers", () => ({
      cookies: async () => ({
        get: (name: string) =>
          name === "token" ? { value: "cookie-jwt" } : undefined,
      }),
    }));
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    const { serverApiClient } = await import("@/lib/api-client");
    await serverApiClient("/me");

    const headers = (fetchMock.mock.calls[0] as [string, RequestInit])[1]
      .headers as Headers;
    expect(headers.get("Cookie")).toBe("token=cookie-jwt");
    vi.doUnmock("next/headers");
  });

  it("sends no cookie header when the session cookie is absent", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_BASE);
    vi.doMock("next/headers", () => ({
      cookies: async () => ({ get: () => undefined }),
    }));
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    const { serverApiClient } = await import("@/lib/api-client");
    await serverApiClient("/me");

    const headers = (fetchMock.mock.calls[0] as [string, RequestInit])[1]
      .headers as Headers;
    expect(headers.has("Cookie")).toBe(false);
    vi.doUnmock("next/headers");
  });
});
