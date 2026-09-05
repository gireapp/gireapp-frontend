"use server";

import { redirect } from "next/navigation";
import { SignJWT } from "jose";
import { setSessionToken, clearSessionToken } from "@/lib/session";
import {
  setPendingVerificationEmail,
  clearPendingVerificationEmail,
} from "@/lib/pending-verification";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  onboardingSchema,
  calculateAge,
} from "@gireapp/shared";
import type { ApiResponse, AcademicLevel } from "@gireapp/shared";
import { API_PATHS } from "@gireapp/shared";
import { serverApiClient, ApiError } from "@/lib/api-client";
import { JWT_SECRET } from "@/lib/auth-secret";
import { safeCallbackUrl } from "@/lib/callback-url";
import { sanitizeString } from "@/lib/sanitize";

/** Login answers 403 in exactly one case: the account exists but is unverified.
 *  Keyed on the status rather than the message so copy edits can't break it. */
const HTTP_EMAIL_UNVERIFIED = 403;

const TRACK_TO_LEVEL: Record<string, AcademicLevel> = {
  Secondary: "SECONDARY",
  Tertiary: "TERTIARY",
  Professional: "PROFESSIONAL",
};

// DEV MOCK: mint a local session so the signup → dashboard flow can be demoed
// without the backend. Active only when MOCK_AUTH=true (see .env.local).
async function createMockSession(data: {
  email: string;
  track?: string;
  department?: string;
  dateOfBirth: string;
}) {
  const isMinor = calculateAge(new Date(data.dateOfBirth)) < 18;
  const token = await new SignJWT({
    userId: `mock-${Date.now()}`,
    role: "STUDENT",
    email: data.email,
    academicLevel: TRACK_TO_LEVEL[data.track ?? ""] ?? "SECONDARY",
    department: data.department ?? null,
    isOnboardingComplete: true,
    isMinor,
    // No email service (Resend) wired up yet, so a minor's guardian confirmation can
    // never actually arrive in this mock path — it stays 'pending' to reflect that
    // honestly rather than silently unlocking Mentorship.
    guardianConsentStatus: isMinor ? "pending" : "not_required",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(`mock-${data.email}`)
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
  await setSessionToken(token);
}

export async function registerAction(
  _prevState: ApiResponse,
  formData: FormData,
): Promise<ApiResponse> {
  const field = (name: string) => (formData.get(name) as string | null) ?? "";

  // Free-text fields are sanitized before validation; passwords are excluded —
  // altering them would silently change the credential. Email/guardianEmail/dateOfBirth
  // are left to Zod's own format validation instead of sanitizeString, which would
  // corrupt them (e.g. HTML-escaping the "@" is unnecessary and the date is a
  // machine-produced <input type="date"> value, not free text).
  const raw = {
    name: sanitizeString(field("name")),
    email: field("email"),
    password: field("password"),
    confirmPassword: field("confirmPassword"),
    dateOfBirth: field("dateOfBirth"),
    guardianEmail: field("guardianEmail"),
    track: sanitizeString(field("track")),
    department: sanitizeString(field("department")),
    level: sanitizeString(field("level")),
    focusArea: sanitizeString(field("focusArea")),
  };

  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (process.env.MOCK_AUTH === "true") {
    await createMockSession(result.data);
    redirect("/dashboard");
  }

  let sessionToken: string | undefined;

  try {
    const { data } = await serverApiClient<{ token?: string; user?: unknown }>(
      API_PATHS.AUTH.REGISTER,
      {
        method: "POST",
        body: JSON.stringify(result.data),
      },
    );

    sessionToken = data.token;
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.fieldErrors,
      };
    }
    return { success: false, error: "Network error. Please try again." };
  }

  // redirect() signals by throwing, so it has to stay outside the try above or
  // the catch would swallow it and report a network failure instead.

  // A token only comes back when the backend is configured to skip verification
  // (SKIP_EMAIL_VERIFICATION); otherwise there is no session until the emailed
  // link is opened, and sending the user to /dashboard just bounces off middleware.
  if (sessionToken) {
    await setSessionToken(sessionToken);
    redirect("/dashboard");
  }

  await setPendingVerificationEmail(result.data.email);
  redirect("/check-email");
}

export async function loginAction(
  _prevState: ApiResponse<{ emailUnverified?: boolean }>,
  formData: FormData,
): Promise<ApiResponse<{ emailUnverified?: boolean }>> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const callbackUrl = safeCallbackUrl(
    formData.get("callbackUrl") as string | null,
  );

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { data } = await serverApiClient<{ token?: string; user?: unknown }>(
      API_PATHS.AUTH.LOGIN,
      {
        method: "POST",
        body: JSON.stringify(result.data),
      },
    );

    // We expect backend to set the HTTP-Only cookie, but if it returns a token in the body we can store it.
    // Wait, the backend in auth.controller.ts uses res.cookie().
    // BUT since frontend and backend are on different domains/ports in dev, we might need to handle tokens manually if CORS credentials don't work easily.
    // Actually, backend sets HTTP-Only cookie. If they are on the same domain in production it works.
    // If backend doesn't return the token in JSON body, we can't set it via setSessionToken.
    // Let's check backend auth.controller.ts: it does NOT return the token in JSON. Wait, it only sets the cookie.
    // So if the backend sets the cookie, the fetch client receives the set-cookie header.
    // We need to forward that Set-Cookie header to the client!
    // Since this is a server action, `apiClient` doesn't automatically forward Set-Cookie to the Next.js response.
    // We should get the token from the response headers or ask backend to return it.
    // For decoupled architecture, it's safer if backend returns token and Next.js sets it in its own cookies.
    // The previous frontend `actions.ts` expected `data.token`. So let's assume backend auth controller needs updating to return the token.
    // We will update backend auth controller later.

    if (data.token) {
      await setSessionToken(data.token);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.fieldErrors,
        data: { emailUnverified: error.status === HTTP_EMAIL_UNVERIFIED },
      };
    }
    return { success: false, error: "Network error. Please try again." };
  }

  redirect(callbackUrl);
}

export async function logoutAction() {
  try {
    await serverApiClient(API_PATHS.AUTH.LOGOUT, { method: "POST" });
  } catch (error) {
    // The frontend cookie is cleared regardless, but a failed backend logout
    // means the token stays valid until expiry — worth a trace in the logs.
    console.error(
      "[GIREAPP] Backend logout failed:",
      error instanceof Error ? error.message : String(error),
    );
  }
  await clearSessionToken();
  redirect("/");
}

export async function forgotPasswordAction(
  _prevState: ApiResponse,
  formData: FormData,
): Promise<ApiResponse> {
  const raw = {
    email: formData.get("email") as string,
  };

  const result = forgotPasswordSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await serverApiClient(API_PATHS.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify(result.data),
    });

    // Always return success to prevent email enumeration
    return { success: true };
  } catch (error) {
    // The caller must not learn whether the address exists, so the failure is
    // logged server-side and the response stays indistinguishable from success.
    console.error("[forgotPasswordAction] request failed:", error);
    return { success: true };
  }
}

export async function resetPasswordAction(
  _prevState: ApiResponse,
  formData: FormData,
): Promise<ApiResponse> {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = resetPasswordSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await serverApiClient(API_PATHS.AUTH.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify(result.data),
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.fieldErrors,
      };
    }
    return {
      success: false,
      error: "Failed to reset password. Please try again.",
    };
  }
}

export async function completeOnboardingAction(
  _prevState: ApiResponse,
  formData: FormData,
): Promise<ApiResponse> {
  const raw = {
    academicLevel: formData.get("academicLevel") as string,
    department: formData.get("department") as string,
    moodTheme: formData.get("moodTheme") as string,
  };

  const result = onboardingSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { data } = await serverApiClient<{ token?: string }>(
      API_PATHS.AUTH.ONBOARDING,
      {
        method: "POST",
        body: JSON.stringify(result.data),
      },
    );

    // If backend returns an updated token (with onboarding flag set), refresh the session
    if (data.token) {
      await setSessionToken(data.token);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.fieldErrors,
      };
    }
    return {
      success: false,
      error: "Failed to save preferences. Please try again.",
    };
  }
}

export async function resendVerificationAction(
  _prevState: ApiResponse,
  formData: FormData,
): Promise<ApiResponse> {
  const result = resendVerificationSchema.safeParse({
    email: formData.get("email") as string,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await serverApiClient(API_PATHS.AUTH.RESEND_VERIFICATION, {
      method: "POST",
      body: JSON.stringify(result.data),
    });
  } catch (error) {
    // Same contract as forgotPasswordAction: the caller must not learn whether
    // the address exists or is already verified, so failures stay server-side.
    console.error("[resendVerificationAction] request failed:", error);
  }

  return { success: true };
}

/**
 * Confirms guardian consent from the one-click link in the guardian's email.
 * The guardian is not a GIREAPP user and has no session, so this runs entirely
 * off the token in the URL.
 */
export async function confirmGuardianConsentAction(
  token: string,
): Promise<ApiResponse<{ message?: string; name?: string }>> {
  try {
    const { data } = await serverApiClient<{ message?: string; name?: string }>(
      API_PATHS.AUTH.GUARDIAN_CONSENT,
      {
        method: "POST",
        body: JSON.stringify({ token }),
      },
    );

    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error:
        "We could not confirm consent. The link may be invalid or expired.",
    };
  }
}

export async function verifyEmailAction(
  token: string,
): Promise<ApiResponse<{ message?: string; name?: string }>> {
  try {
    const { data } = await serverApiClient<{
      message?: string;
      name?: string;
    }>(API_PATHS.AUTH.VERIFY_EMAIL, {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    // The address has served its purpose once the link is opened. This runs
    // during a Server Component render, where Next refuses cookie writes — so a
    // failure here must never mask a verification that actually succeeded. The
    // cookie carries its own 30-minute TTL and expires regardless.
    try {
      await clearPendingVerificationEmail();
    } catch {
      // Non-fatal: the account is verified either way.
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Verification failed. The link may be invalid or expired.",
    };
  }
}
