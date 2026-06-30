// ─────────────────────────────────────────────────
// GIREAPP — API Client Configuration
// Centralised, type-safe HTTP client for backend API
// ─────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
export async function apiClient<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<{ data: T; status: number }> {
  const { token, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${path}`;

  // Validate URL to prevent SSRF — only allow calls to our own API
  const parsed = new URL(url);
  const allowedBase = new URL(API_BASE_URL);
  if (parsed.origin !== allowedBase.origin) {
    throw new Error('SSRF Protection: Request blocked — URL does not match API base.');
  }

  const headers = new Headers(fetchOptions.headers);

  // Set default content-type for JSON bodies
  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach auth token if provided (for server-side calls)
  if (token) {
    headers.set('Cookie', `token=${token}`);
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    // Include credentials for browser-side calls (sends cookies)
    credentials: 'include',
  });

  // Parse response
  let data: T;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = (await response.text()) as unknown as T;
  }

  if (!response.ok) {
    const errorData = data as Record<string, unknown>;
    const errorMessage = (errorData?.error as string) || `API Error: ${response.status}`;
    const error = new ApiError(errorMessage, response.status, errorData);
    throw error;
  }

  return { data, status: response.status };
}

/**
 * Custom error class for API errors — carries status code and error payload.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
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
  options: RequestInit = {}
): Promise<{ data: T; status: number }> {
  // Dynamic import to avoid bundling server-only code in client
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  return apiClient<T>(path, { ...options, token });
}
