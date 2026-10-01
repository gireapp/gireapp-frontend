// ─────────────────────────────────────────────────
// GIREAPP — API Client Configuration
// Centralised, type-safe HTTP client for backend API
// ─────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Upper bound on a single backend call. Generous enough to absorb a serverless
 * database cold start (Neon suspends idle compute), short enough that a stalled
 * connection surfaces as an error instead of a spinner that never resolves.
 */
const REQUEST_TIMEOUT_MS = 20_000;

/** Not a real HTTP status from the backend — marks a client-side timeout. */
const HTTP_GATEWAY_TIMEOUT = 504;

/**
 * Type-safe fetch wrapper for the GIREAPP backend API.
 * Automatically handles:
 * - Base URL prefixing
 * - JSON content-type headers
 * - Cookie forwarding (for SSR server actions)
 * - Error response parsing
 *
 * SECURITY: Never sends credentials to third-party domains.
 */
/** Pagination block carried alongside `data` by `PaginatedResponse`. */
export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function apiClient<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<{ data: T; status: number; meta?: ApiMeta }> {
  const { token, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${path}`;

  // Validate URL to prevent SSRF — only allow calls to our own API
  const parsed = new URL(url);
  const allowedBase = new URL(API_BASE_URL);
  if (parsed.origin !== allowedBase.origin) {
    throw new Error(
      "SSRF Protection: Request blocked — URL does not match API base.",
    );
  }

  const headers = new Headers(fetchOptions.headers);

  // Set default content-type for JSON bodies
  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Attach auth token if provided (for server-side calls)
  if (token) {
    headers.set("Cookie", `token=${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      // Include credentials for browser-side calls (sends cookies)
      credentials: "include",
      // An explicit caller signal wins; otherwise fall back to the default bound.
      signal: fetchOptions.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      throw new ApiError(
        "The server took too long to respond. Please try again.",
        HTTP_GATEWAY_TIMEOUT,
      );
    }
    throw error;
  }

  // Parse response
  let body: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const errorData = body as Record<string, unknown>;
    const errorMessage =
      (errorData?.error as string) || `API Error: ${response.status}`;
    const error = new ApiError(errorMessage, response.status, errorData);
    throw error;
  }

  // Unwrap the { success, data } envelope so callers receive the payload
  // directly. Endpoints still returning a bare object pass through untouched,
  // which is what lets the backend migrate one route at a time.
  const data = (isEnvelope(body) ? body.data : body) as T;

  // `meta` sits beside `data` in PaginatedResponse, so unwrapping the envelope
  // would otherwise throw the page count away.
  return { data, status: response.status, meta: metaOf(body) };
}

function metaOf(body: unknown): ApiMeta | undefined {
  if (typeof body !== "object" || body === null || !("meta" in body)) {
    return undefined;
  }
  const meta = (body as { meta: unknown }).meta;
  return typeof meta === "object" && meta !== null
    ? (meta as ApiMeta)
    : undefined;
}

/** A wrapped success response: `{ success: true, data: … }`. */
function isEnvelope(
  body: unknown,
): body is { success: boolean; data: unknown } {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    "data" in body &&
    typeof (body as { success: unknown }).success === "boolean"
  );
}

/**
 * Custom error class for API errors — carries status code and error payload.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Check if this is an authentication error */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Check if this is a validation error */
  get isValidationError(): boolean {
    return this.status === 422;
  }

  /** Get field-level validation errors (if present) */
  get fieldErrors(): Record<string, string[]> | undefined {
    return this.data?.errors as Record<string, string[]> | undefined;
  }
}

/**
 * Server-side API client that reads the auth token from cookies.
 * Use in Server Components and Server Actions.
 */
export async function serverApiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; status: number; meta?: ApiMeta }> {
  // Dynamic import to avoid bundling server-only code in client
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return apiClient<T>(path, { ...options, token });
}
