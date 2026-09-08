import { describe, it, expect, vi, beforeEach } from "vitest";
import { API_PATHS } from "@gireapp/shared";

const { redirectMock, clearSessionTokenMock, apiMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  clearSessionTokenMock: vi.fn(),
  apiMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));

vi.mock("@/lib/session", () => ({ clearSessionToken: clearSessionTokenMock }));

// ApiError must stay the real class so `instanceof` checks in the action hold.
vi.mock("@/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-client")>();
  return { ...actual, serverApiClient: apiMock };
});

import { ApiError } from "@/lib/api-client";
import {
  changePasswordAction,
  endChangedPasswordSession,
  updateEmailAction,
  confirmEmailChangeAction,
} from "@/features/settings/actions";

function formDataOf(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

const VALID = {
  currentPassword: "OldPassw0rd",
  password: "NewPassw0rd",
  confirmPassword: "NewPassw0rd",
};

beforeEach(() => {
  vi.clearAllMocks();
  apiMock.mockResolvedValue({ data: { message: "Password changed" } });
});

describe("changePasswordAction", () => {
  it("posts the validated payload to the change-password endpoint", async () => {
    const result = await changePasswordAction(
      { success: false },
      formDataOf(VALID),
    );

    expect(result).toEqual({ success: true });
    expect(apiMock).toHaveBeenCalledWith(API_PATHS.AUTH.CHANGE_PASSWORD, {
      method: "POST",
      body: JSON.stringify(VALID),
    });
  });

  it("never reaches the backend when the confirmation does not match", async () => {
    const result = await changePasswordAction(
      { success: false },
      formDataOf({ ...VALID, confirmPassword: "Different1" }),
    );

    expect(apiMock).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    expect(result.errors?.confirmPassword).toContain("Passwords do not match");
  });

  it("refuses a new password that is the current one", async () => {
    const result = await changePasswordAction(
      { success: false },
      formDataOf({
        currentPassword: "SamePassw0rd",
        password: "SamePassw0rd",
        confirmPassword: "SamePassw0rd",
      }),
    );

    expect(apiMock).not.toHaveBeenCalled();
    expect(result.errors?.password).toContain(
      "Your new password must be different from your current one",
    );
  });

  it("passes the backend's field errors straight through", async () => {
    apiMock.mockRejectedValue(
      new ApiError("Validation failed.", 422, {
        errors: { currentPassword: ["That is not your current password"] },
      }),
    );

    const result = await changePasswordAction(
      { success: false },
      formDataOf(VALID),
    );

    expect(result.success).toBe(false);
    expect(result.errors?.currentPassword).toContain(
      "That is not your current password",
    );
  });

  it("reports a network failure without leaking the underlying error", async () => {
    apiMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await changePasswordAction(
      { success: false },
      formDataOf(VALID),
    );

    expect(result).toEqual({
      success: false,
      error: "Failed to change your password. Please try again.",
    });
  });

  it("leaves the session cookie alone so the confirmation can be read", async () => {
    await changePasswordAction({ success: false }, formDataOf(VALID));

    expect(clearSessionTokenMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("endChangedPasswordSession", () => {
  it("drops the dead session and sends the learner to log in", async () => {
    await endChangedPasswordSession();

    expect(clearSessionTokenMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});

describe("updateEmailAction", () => {
  const VALID = {
    newEmail: "new@example.com",
    confirmEmail: "new@example.com",
    currentPassword: "OldPassw0rd",
  };

  it("posts the normalised payload to the update-email endpoint", async () => {
    const result = await updateEmailAction(
      { success: false },
      formDataOf({
        newEmail: "NEW@Example.com ",
        confirmEmail: " new@example.COM",
        currentPassword: "OldPassw0rd",
      }),
    );

    expect(result).toEqual({ success: true });
    expect(apiMock).toHaveBeenCalledWith(API_PATHS.AUTH.UPDATE_EMAIL, {
      method: "POST",
      body: JSON.stringify(VALID),
    });
  });

  it("never reaches the backend when the confirmation does not match", async () => {
    const result = await updateEmailAction(
      { success: false },
      formDataOf({ ...VALID, confirmEmail: "typo@example.com" }),
    );

    expect(apiMock).not.toHaveBeenCalled();
    expect(result.errors?.confirmEmail).toContain(
      "Email addresses do not match",
    );
  });

  it("rejects a malformed address before the request is made", async () => {
    const result = await updateEmailAction(
      { success: false },
      formDataOf({ ...VALID, newEmail: "nope.com", confirmEmail: "nope.com" }),
    );

    expect(apiMock).not.toHaveBeenCalled();
    expect(result.errors?.newEmail).toContain(
      "Please enter a valid email address",
    );
  });

  it("passes the backend's field errors straight through", async () => {
    apiMock.mockRejectedValue(
      new ApiError("Validation failed.", 409, {
        errors: { newEmail: ["That email address is already in use"] },
      }),
    );

    const result = await updateEmailAction(
      { success: false },
      formDataOf(VALID),
    );

    expect(result.errors?.newEmail).toContain(
      "That email address is already in use",
    );
  });

  it("reports a network failure without leaking the underlying error", async () => {
    apiMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await updateEmailAction(
      { success: false },
      formDataOf(VALID),
    );

    expect(result).toEqual({
      success: false,
      error: "Failed to update your email address. Please try again.",
    });
  });

  it("never reaches the backend without the current password", async () => {
    const result = await updateEmailAction(
      { success: false },
      formDataOf({ ...VALID, currentPassword: "" }),
    );

    expect(apiMock).not.toHaveBeenCalled();
    expect(result.errors?.currentPassword).toContain(
      "Please enter your current password",
    );
  });

  it("leaves the session alone — nothing has changed until the link is opened", async () => {
    await updateEmailAction({ success: false }, formDataOf(VALID));

    expect(clearSessionTokenMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("confirmEmailChangeAction", () => {
  it("sends the token from the link and returns the new address", async () => {
    apiMock.mockResolvedValue({ data: { email: "new@example.com" } });

    const result = await confirmEmailChangeAction("raw-token");

    expect(apiMock).toHaveBeenCalledWith(API_PATHS.AUTH.CONFIRM_EMAIL_CHANGE, {
      method: "POST",
      body: JSON.stringify({ token: "raw-token" }),
    });
    expect(result.data?.email).toBe("new@example.com");
  });

  it("reports the backend's reason for refusing a link", async () => {
    apiMock.mockRejectedValue(
      new ApiError(
        "This confirmation link is invalid or has expired.",
        400,
        {},
      ),
    );

    const result = await confirmEmailChangeAction("stale");

    expect(result).toEqual({
      success: false,
      error: "This confirmation link is invalid or has expired.",
    });
  });

  it("never writes cookies — it runs during a Server Component render", async () => {
    apiMock.mockResolvedValue({ data: { email: "new@example.com" } });

    await confirmEmailChangeAction("raw-token");

    expect(clearSessionTokenMock).not.toHaveBeenCalled();
  });
});
