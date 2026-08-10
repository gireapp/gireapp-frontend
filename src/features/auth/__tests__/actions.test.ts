import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { redirectMock, setSessionTokenMock, clearSessionTokenMock, apiMock } =
  vi.hoisted(() => ({
    redirectMock: vi.fn(),
    setSessionTokenMock: vi.fn(),
    clearSessionTokenMock: vi.fn(),
    apiMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));

vi.mock("@/lib/session", () => ({
  setSessionToken: setSessionTokenMock,
  clearSessionToken: clearSessionTokenMock,
}));

// ApiError must stay the real class so `instanceof` checks in the actions hold.
vi.mock("@/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-client")>();
  return { ...actual, serverApiClient: apiMock };
});

import {
  registerAction,
  loginAction,
  logoutAction,
  forgotPasswordAction,
  resetPasswordAction,
  completeOnboardingAction,
  verifyEmailAction,
} from "@/features/auth/actions";
import { ApiError } from "@/lib/api-client";

const REDIRECT_PREFIX = "NEXT_REDIRECT:";

/** Mirrors Next's redirect(), which aborts the action by throwing. */
function redirectedTo(error: unknown): string | null {
  const message = error instanceof Error ? error.message : "";
  return message.startsWith(REDIRECT_PREFIX)
    ? message.slice(REDIRECT_PREFIX.length)
    : null;
}

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const VALID_REGISTRATION = {
  name: "Tobi Ojo",
  email: "Tobi@Example.COM",
  password: "Passw0rdd",
  confirmPassword: "Passw0rdd",
  dateOfBirth: "1990-01-01",
  guardianEmail: "",
  track: "Secondary",
  department: "Science",
  level: "SS3",
  focusArea: "WAEC Prep",
};

const INITIAL = { success: false } as const;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("MOCK_AUTH", "false");
  redirectMock.mockImplementation((url: string) => {
    throw new Error(`${REDIRECT_PREFIX}${url}`);
  });
  apiMock.mockResolvedValue({ data: {}, status: 200 });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("registerAction", () => {
  it("returns field errors and calls no API when validation fails", async () => {
    const result = await registerAction(
      INITIAL,
      formData({ ...VALID_REGISTRATION, email: "not-an-email" }),
    );

    expect(result.success).toBe(false);
    expect(result.errors?.email).toBeDefined();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords against the confirm field", async () => {
    const result = await registerAction(
      INITIAL,
      formData({ ...VALID_REGISTRATION, confirmPassword: "Different1" }),
    );

    expect(result.errors?.confirmPassword).toContain("Passwords do not match");
  });

  it("requires a guardian email for under-18 registrations", async () => {
    const fifteenYearsAgo = new Date();
    fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

    const result = await registerAction(
      INITIAL,
      formData({
        ...VALID_REGISTRATION,
        dateOfBirth: fifteenYearsAgo.toISOString().slice(0, 10),
        guardianEmail: "",
      }),
    );

    expect(result.errors?.guardianEmail).toContain(
      "A guardian email is required for accounts under 18",
    );
    expect(apiMock).not.toHaveBeenCalled();
  });

  it("accepts an under-18 registration that supplies a guardian email", async () => {
    const fifteenYearsAgo = new Date();
    fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

    const error = await registerAction(
      INITIAL,
      formData({
        ...VALID_REGISTRATION,
        dateOfBirth: fifteenYearsAgo.toISOString().slice(0, 10),
        guardianEmail: "parent@example.com",
      }),
    ).catch((e: unknown) => e);

    expect(redirectedTo(error)).toBe("/dashboard");
    const body = JSON.parse(apiMock.mock.calls[0]?.[1].body as string);
    expect(body.guardianEmail).toBe("parent@example.com");
  });

  it("normalises the email and posts the registration, then redirects", async () => {
    apiMock.mockResolvedValue({ data: { token: "jwt-new" }, status: 201 });

    const error = await registerAction(
      INITIAL,
      formData(VALID_REGISTRATION),
    ).catch((e: unknown) => e);

    const body = JSON.parse(apiMock.mock.calls[0]?.[1].body as string);
    expect(body.email).toBe("tobi@example.com");
    expect(setSessionTokenMock).toHaveBeenCalledWith("jwt-new");
    expect(redirectedTo(error)).toBe("/dashboard");
  });

  it("does not set a session when the backend returns no token", async () => {
    apiMock.mockResolvedValue({ data: {}, status: 201 });

    await registerAction(INITIAL, formData(VALID_REGISTRATION)).catch(
      () => undefined,
    );

    expect(setSessionTokenMock).not.toHaveBeenCalled();
  });

  it("surfaces backend field errors from an ApiError", async () => {
    apiMock.mockRejectedValue(
      new ApiError("Email already registered", 422, {
        errors: { email: ["Email already registered"] },
      }),
    );

    const result = await registerAction(INITIAL, formData(VALID_REGISTRATION));

    expect(result).toMatchObject({
      success: false,
      error: "Email already registered",
      errors: { email: ["Email already registered"] },
    });
  });

  it("reports a generic network message for non-API failures", async () => {
    apiMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await registerAction(INITIAL, formData(VALID_REGISTRATION));

    expect(result).toEqual({
      success: false,
      error: "Network error. Please try again.",
    });
  });
});

describe("loginAction", () => {
  const CREDENTIALS = { email: "tobi@example.com", password: "Passw0rdd" };

  it("returns field errors for an invalid email", async () => {
    const result = await loginAction(
      INITIAL,
      formData({ ...CREDENTIALS, email: "nope" }),
    );

    expect(result.errors?.email).toBeDefined();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it("requires a password", async () => {
    const result = await loginAction(
      INITIAL,
      formData({ ...CREDENTIALS, password: "" }),
    );

    expect(result.errors?.password).toContain("Password is required");
  });

  it("stores the returned token and redirects to the dashboard by default", async () => {
    apiMock.mockResolvedValue({ data: { token: "jwt-login" }, status: 200 });

    const error = await loginAction(INITIAL, formData(CREDENTIALS)).catch(
      (e: unknown) => e,
    );

    expect(setSessionTokenMock).toHaveBeenCalledWith("jwt-login");
    expect(redirectedTo(error)).toBe("/dashboard");
  });

  it("honours a safe relative callback url", async () => {
    const error = await loginAction(
      INITIAL,
      formData({ ...CREDENTIALS, callbackUrl: "/dashboard/courses" }),
    ).catch((e: unknown) => e);

    expect(redirectedTo(error)).toBe("/dashboard/courses");
  });

  it.each(["https://evil.test", "//evil.test", "javascript:alert(1)"])(
    "refuses the open-redirect candidate %s",
    async (callbackUrl) => {
      const error = await loginAction(
        INITIAL,
        formData({ ...CREDENTIALS, callbackUrl }),
      ).catch((e: unknown) => e);

      expect(redirectedTo(error)).toBe("/dashboard");
    },
  );

  it("surfaces invalid-credential errors from the backend", async () => {
    apiMock.mockRejectedValue(new ApiError("Invalid credentials", 401));

    const result = await loginAction(INITIAL, formData(CREDENTIALS));

    expect(result).toMatchObject({
      success: false,
      error: "Invalid credentials",
    });
    expect(setSessionTokenMock).not.toHaveBeenCalled();
  });
});

describe("logoutAction", () => {
  it("clears the session and returns to the landing page", async () => {
    const error = await logoutAction().catch((e: unknown) => e);

    expect(clearSessionTokenMock).toHaveBeenCalled();
    expect(redirectedTo(error)).toBe("/");
  });

  it("still clears the cookie when the backend logout fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    apiMock.mockRejectedValue(new Error("backend down"));

    const error = await logoutAction().catch((e: unknown) => e);

    expect(clearSessionTokenMock).toHaveBeenCalled();
    expect(redirectedTo(error)).toBe("/");
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("forgotPasswordAction", () => {
  it("rejects an invalid email before calling the API", async () => {
    const result = await forgotPasswordAction(
      INITIAL,
      formData({ email: "nope" }),
    );

    expect(result.errors?.email).toBeDefined();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it("reports success for a valid request", async () => {
    const result = await forgotPasswordAction(
      INITIAL,
      formData({ email: "tobi@example.com" }),
    );

    expect(result).toEqual({ success: true });
  });

  it("reports success even when the backend fails, to prevent email enumeration", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    apiMock.mockRejectedValue(new ApiError("No such user", 404));

    const result = await forgotPasswordAction(
      INITIAL,
      formData({ email: "ghost@example.com" }),
    );

    expect(result).toEqual({ success: true });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe("resetPasswordAction", () => {
  const RESET = {
    token: "reset-token",
    password: "NewPassw0rd",
    confirmPassword: "NewPassw0rd",
  };

  it("requires a reset token", async () => {
    const result = await resetPasswordAction(
      INITIAL,
      formData({ ...RESET, token: "" }),
    );

    expect(result.errors?.token).toContain("Reset token is required");
    expect(apiMock).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords", async () => {
    const result = await resetPasswordAction(
      INITIAL,
      formData({ ...RESET, confirmPassword: "Mismatch1" }),
    );

    expect(result.errors?.confirmPassword).toContain("Passwords do not match");
  });

  it("rejects a password that misses the complexity rule", async () => {
    const result = await resetPasswordAction(
      INITIAL,
      formData({
        ...RESET,
        password: "alllowercase",
        confirmPassword: "alllowercase",
      }),
    );

    expect(result.errors?.password).toBeDefined();
  });

  it("returns success once the backend accepts the reset", async () => {
    const result = await resetPasswordAction(INITIAL, formData(RESET));

    expect(result).toEqual({ success: true });
  });

  it("surfaces an expired-token error from the backend", async () => {
    apiMock.mockRejectedValue(new ApiError("Reset link expired", 400));

    const result = await resetPasswordAction(INITIAL, formData(RESET));

    expect(result).toMatchObject({
      success: false,
      error: "Reset link expired",
    });
  });

  it("reports a friendly message for non-API failures", async () => {
    apiMock.mockRejectedValue(new Error("socket hang up"));

    const result = await resetPasswordAction(INITIAL, formData(RESET));

    expect(result.error).toBe("Failed to reset password. Please try again.");
  });
});

describe("completeOnboardingAction", () => {
  const ONBOARDING = {
    academicLevel: "SECONDARY",
    department: "Science",
    moodTheme: "calm",
  };

  it("rejects a department that does not belong to the academic level", async () => {
    const result = await completeOnboardingAction(
      INITIAL,
      formData({ ...ONBOARDING, department: "Postgraduate" }),
    );

    expect(result.errors?.department).toContain(
      "Selected department does not match your academic level",
    );
    expect(apiMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown academic level", async () => {
    const result = await completeOnboardingAction(
      INITIAL,
      formData({ ...ONBOARDING, academicLevel: "GRADUATE" }),
    );

    expect(result.errors?.academicLevel).toBeDefined();
  });

  it("refreshes the session when the backend returns a new token", async () => {
    apiMock.mockResolvedValue({
      data: { token: "jwt-onboarded" },
      status: 200,
    });

    const result = await completeOnboardingAction(
      INITIAL,
      formData(ONBOARDING),
    );

    expect(result).toEqual({ success: true });
    expect(setSessionTokenMock).toHaveBeenCalledWith("jwt-onboarded");
  });

  it("succeeds without a token refresh when none is returned", async () => {
    const result = await completeOnboardingAction(
      INITIAL,
      formData(ONBOARDING),
    );

    expect(result).toEqual({ success: true });
    expect(setSessionTokenMock).not.toHaveBeenCalled();
  });

  it("reports a friendly message for non-API failures", async () => {
    apiMock.mockRejectedValue(new Error("socket hang up"));

    const result = await completeOnboardingAction(
      INITIAL,
      formData(ONBOARDING),
    );

    expect(result.error).toBe("Failed to save preferences. Please try again.");
  });
});

describe("verifyEmailAction", () => {
  it("returns the backend payload on success", async () => {
    apiMock.mockResolvedValue({
      data: { message: "Email verified" },
      status: 200,
    });

    const result = await verifyEmailAction("verify-token");

    expect(result).toEqual({
      success: true,
      data: { message: "Email verified" },
    });
  });

  it("surfaces the backend message for an invalid token", async () => {
    apiMock.mockRejectedValue(new ApiError("Token already used", 400));

    const result = await verifyEmailAction("stale-token");

    expect(result).toMatchObject({
      success: false,
      error: "Token already used",
    });
  });

  it("reports a friendly message for non-API failures", async () => {
    apiMock.mockRejectedValue(new Error("socket hang up"));

    const result = await verifyEmailAction("any-token");

    expect(result.error).toBe(
      "Verification failed. The link may be invalid or expired.",
    );
  });
});
