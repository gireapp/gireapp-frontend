// ─────────────────────────────────────────────────
// GIREAPP — Server-side action logging
// Logs message/status only; never the full error object,
// which may carry backend response bodies or stack traces.
// ─────────────────────────────────────────────────

import { ApiError } from '@/lib/api-client';

export function logActionError(context: string, error: unknown): void {
  const detail =
    error instanceof ApiError
      ? `${error.status} ${error.message}`
      : error instanceof Error
        ? error.message
        : String(error);
  console.error(`[GIREAPP] ${context}:`, detail);
}
