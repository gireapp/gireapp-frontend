"use server";

import { redirect } from "next/navigation";
import { changePasswordSchema, API_PATHS } from "@gireapp/shared";
import type { ApiResponse } from "@gireapp/shared";
import { serverApiClient, ApiError } from "@/lib/api-client";
import { clearSessionToken } from "@/lib/session";

/**
 * Change the password from inside the account. The backend stamps
 * `passwordChangedAt`, which retires every token the account has — this one
 * included. The cookie is deliberately left in place here so the screen can
 * show its confirmation; `endChangedPasswordSession` drops it a moment later.
 */
export async function changePasswordAction(
  _prevState: ApiResponse,
  formData: FormData,
): Promise<ApiResponse> {
  const result = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await serverApiClient(API_PATHS.AUTH.CHANGE_PASSWORD, {
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
      error: "Failed to change your password. Please try again.",
    };
  }
}

/**
 * Drop the session the password change already invalidated and send the learner
 * back to log in. Kept separate from the change itself so the cookie survives
 * long enough for the confirmation to be read.
 */
export async function endChangedPasswordSession(): Promise<void> {
  await clearSessionToken();
  redirect("/login");
}
