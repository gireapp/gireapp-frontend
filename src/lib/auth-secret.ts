// ─────────────────────────────────────────────────
// GIREAPP — JWT Secret (single source of truth)
// Imported by middleware (edge) and session/actions (node)
// ─────────────────────────────────────────────────

const secret = process.env.AUTH_SECRET;

// The known fallback secret is only acceptable in local development/test.
// Staging, preview, and production builds must provide AUTH_SECRET.
if (!secret && process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
  throw new Error('AUTH_SECRET environment variable is required outside development');
}

export const JWT_SECRET = new TextEncoder().encode(secret || 'fallback-dev-secret-change-me');
