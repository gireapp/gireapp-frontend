// ─────────────────────────────────────────────────
// GIREAPP — Input Sanitisation Utility (BE-SEC-005)
// Strips SQL injection patterns, escapes XSS tags
// ─────────────────────────────────────────────────

/**
 * SQL injection patterns used for threat *detection* only (see `detectThreats`).
 * Never used to rewrite input: the backend parameterises every query, so there is
 * no injection risk to strip here, and removing these tokens silently mangles
 * legitimate content — "Union Ekpo" became "Ekpo", "Cast Iron" became "Iron".
 */
const SQL_INJECTION_PATTERNS = [
  // Statement *shapes*, not bare keywords. A keyword followed only by whitespace
  // matches ordinary language — "Union Ekpo", "Cast Iron", "Drop Anchor" were all
  // rejected — so each verb must be accompanied by the syntax real SQL requires.
  /\bUNION\s+(?:ALL\s+)?SELECT\b/gi,
  // The gap between SELECT and FROM is constrained to an actual select list —
  // `*`, or identifiers/function calls optionally comma-separated. Allowing any
  // characters matched English too ("select a course from the list"); a select
  // list never contains bare prose, because every item must be one token.
  /\bSELECT\s+(?:DISTINCT\s+|TOP\s+\d+\s+)?(?:\*|[\w.*`"'()[\]]+(?:\s*,\s*[\w.*`"'()[\]]+){0,32})\s+FROM\b/gi,
  /\bINSERT\s+INTO\b/gi,
  // Same reasoning: UPDATE takes exactly one table reference before SET, so
  // "update your profile and set a new password" no longer qualifies.
  /\bUPDATE\s+[\w.`"'[\]]+\s+SET\b/gi,
  /\bDELETE\s+FROM\b/gi,
  /\b(?:DROP|CREATE|ALTER|TRUNCATE)\s+(?:TABLE|DATABASE|SCHEMA|INDEX|VIEW)\b/gi,
  /\b(?:EXEC|EXECUTE)\s*\(/gi,
  /\bDECLARE\s+@/gi,
  /\bCAST\s*\(/gi,
  /(--|;|\/\*|\*\/|xp_|sp_)/gi,
  /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi, // OR 1=1, AND 1=1
  // Word-bounded so it matches a standalone hex literal (`SELECT 0x414243`) and
  // not "0x…" buried inside an ordinary token — randomly generated email aliases
  // (e.g. Firefox Relay masks) routinely contain such a substring.
  /\b0x[0-9a-fA-F]+\b/g, // Hex-encoded strings
  /(\bCHAR\s*\(\d+\))/gi, // CHAR() encoding
  /(WAITFOR\s+DELAY|BENCHMARK\s*\()/gi, // Time-based injection
  /(\bINFORMATION_SCHEMA\b)/gi, // Schema enumeration
];

/**
 * XSS patterns to neutralise in user input.
 * Strips script tags, event handlers, javascript: URIs, data: URIs.
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, // onerror=, onclick=, etc.
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /expression\s*\(/gi, // CSS expression()
];

/**
 * Sanitise a single string value:
 * 1. Strip XSS patterns
 * 2. Escape XSS-relevant HTML entities
 * 3. Trim whitespace
 *
 * SQL keywords are deliberately left intact — see `SQL_INJECTION_PATTERNS`.
 */
export function sanitizeString(input: string): string {
  let sanitized = input;

  // Strip XSS patterns
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // Escape remaining HTML entities that could be dangerous
  sanitized = sanitized
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return sanitized.trim();
}

/**
 * Sanitise a string but preserve basic markdown formatting.
 * Used for rich-text fields like lesson content and quiz explanations.
 * Strips XSS but keeps markdown-safe characters — and, like `sanitizeString`,
 * leaves SQL keywords alone so lesson prose about databases survives intact.
 */
export function sanitizeRichText(input: string): string {
  let sanitized = input;

  // Strip only dangerous XSS patterns (keep markdown-safe HTML like <em>, <strong>)
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  return sanitized.trim();
}

/**
 * Recursively sanitise all string values in a JSON-like object.
 * Handles nested objects and arrays.
 * Fields listed in `richTextFields` use the markdown-safe sanitizer.
 */
export function sanitizeObject<T>(
  obj: T,
  richTextFields: string[] = ["content", "explanation", "message"],
): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      sanitizeObject(item, richTextFields),
    ) as unknown as T;
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof value === "string" && richTextFields.includes(key)) {
        sanitized[key] = sanitizeRichText(value);
      } else {
        sanitized[key] = sanitizeObject(value, richTextFields);
      }
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Validate that a request body doesn't contain common attack payloads.
 * Returns an array of detected threat types (empty = safe).
 */
/**
 * `RegExp.test()` on a /g/ pattern advances `lastIndex` and leaves it there, so
 * these shared module-level patterns carry state between calls. Resetting before
 * every test is what makes detection deterministic — previously a match left the
 * index dirty (the old reset only ran when the test *failed*), and the next call
 * scanned from that offset, so identical input alternated between flagged and clean.
 */
function matchesAnyPattern(patterns: RegExp[], input: string): boolean {
  return patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(input);
  });
}

export function detectThreats(input: string): string[] {
  const threats: string[] = [];

  if (matchesAnyPattern(SQL_INJECTION_PATTERNS, input)) {
    threats.push("sql_injection");
  }

  if (matchesAnyPattern(XSS_PATTERNS, input)) {
    threats.push("xss");
  }

  return threats;
}
