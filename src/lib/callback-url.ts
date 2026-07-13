// ─────────────────────────────────────────────────
// GIREAPP — callbackUrl validation (open-redirect guard)
// Single source of truth for middleware, login form, and loginAction
// ─────────────────────────────────────────────────

/**
 * Return `raw` only if it is a safe same-origin path; otherwise `fallback`.
 * Rejects absolute URLs, protocol-relative URLs (`//evil.com`), the backslash
 * variant (`/\evil.com`, which browsers normalise to `//`), and control chars.
 */
export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback: string = '/dashboard'
): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/')) return fallback;
  if (raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F]/.test(raw)) return fallback;
  return raw;
}
