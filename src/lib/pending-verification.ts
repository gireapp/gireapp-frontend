// ─────────────────────────────────────────────────
// GIREAPP — Pending Verification Email
// Carries the just-registered address to the "check your inbox" screen
// ─────────────────────────────────────────────────

import { cookies } from "next/headers";

const COOKIE_NAME = "pending_verification_email";

/**
 * Long enough to read the screen and hit resend, short enough that the address
 * doesn't linger on a shared device. A query parameter would be simpler but
 * would write the address into browser history and referrer headers.
 */
const COOKIE_MAX_AGE_SECONDS = 30 * 60;

export async function setPendingVerificationEmail(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function getPendingVerificationEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function clearPendingVerificationEmail() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
