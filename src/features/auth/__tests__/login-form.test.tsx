// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const {
  loginActionMock,
  resendVerificationActionMock,
  pushMock,
  refreshMock,
  searchParams,
  toastMock,
} = vi.hoisted(() => ({
  loginActionMock: vi.fn(),
  resendVerificationActionMock: vi.fn(),
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  searchParams: new URLSearchParams(),
  toastMock: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/features/auth/actions", () => ({
  loginAction: loginActionMock,
  resendVerificationAction: resendVerificationActionMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  useSearchParams: () => searchParams,
}));

vi.mock("sonner", () => ({ toast: toastMock }));

import { LoginForm } from "@/features/auth/login-form";

function resetParams(entries: Record<string, string> = {}) {
  for (const key of [...searchParams.keys()]) searchParams.delete(key);
  for (const [key, value] of Object.entries(entries))
    searchParams.set(key, value);
}

beforeEach(() => {
  vi.clearAllMocks();
  resetParams();
  loginActionMock.mockResolvedValue({ success: false });
  resendVerificationActionMock.mockResolvedValue({ success: false });
});

describe("LoginForm — rendering", () => {
  it("renders email and password fields plus the submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("links to forgot-password and register", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("link", { name: "Forgot password?" }),
    ).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("masks the password until the toggle is used", async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);
    const field = screen.getByLabelText("Password");

    expect(field).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(field).toHaveAttribute("type", "text");
  });
});

describe("LoginForm — client-side validation", () => {
  it("reports an invalid email on blur", async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "not-an-email");
    await user.tab();

    expect(
      await screen.findByText("Please enter a valid email address"),
    ).toBeInTheDocument();
  });

  it("reports a missing email on blur", async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);

    await user.click(screen.getByLabelText("Email Address"));
    await user.tab();

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
  });

  it("stays quiet before the field is touched", () => {
    render(<LoginForm />);

    expect(
      screen.queryByText("Please enter a valid email address"),
    ).not.toBeInTheDocument();
  });

  it("clears the error once the value becomes valid", async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);
    const email = screen.getByLabelText("Email Address");

    await user.type(email, "bad");
    await user.tab();
    await screen.findByText("Please enter a valid email address");

    await user.clear(email);
    await user.type(email, "tobi@example.com");

    await waitFor(() =>
      expect(
        screen.queryByText("Please enter a valid email address"),
      ).not.toBeInTheDocument(),
    );
  });
});

describe("LoginForm — submission", () => {
  it("posts the credentials to the action", async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(loginActionMock).toHaveBeenCalled());
    const formData = loginActionMock.mock.calls[0]?.[1] as FormData;
    expect(formData.get("email")).toBe("tobi@example.com");
    expect(formData.get("password")).toBe("Passw0rdd");
  });

  it("defaults the callback url to the dashboard", async () => {
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(loginActionMock).toHaveBeenCalled());
    const formData = loginActionMock.mock.calls[0]?.[1] as FormData;
    expect(formData.get("callbackUrl")).toBe("/dashboard");
  });

  it("passes a safe relative callback url straight through", async () => {
    resetParams({ callbackUrl: "/dashboard/courses" });
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(loginActionMock).toHaveBeenCalled());
    const formData = loginActionMock.mock.calls[0]?.[1] as FormData;
    expect(formData.get("callbackUrl")).toBe("/dashboard/courses");
  });

  it.each(["https://evil.test", "//evil.test"])(
    "refuses to forward the off-site callback %s",
    async (callbackUrl) => {
      resetParams({ callbackUrl });
      const user = userEvent.setup({ delay: null });
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText("Email Address"),
        "tobi@example.com",
      );
      await user.type(screen.getByLabelText("Password"), "Passw0rdd");
      await user.click(screen.getByRole("button", { name: "Log in" }));

      await waitFor(() => expect(loginActionMock).toHaveBeenCalled());
      const formData = loginActionMock.mock.calls[0]?.[1] as FormData;
      expect(formData.get("callbackUrl")).toBe("/dashboard");
    },
  );

  it("navigates to the callback url on success", async () => {
    loginActionMock.mockResolvedValue({ success: true });
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect(toastMock.success).toHaveBeenCalledWith("Welcome back!");
  });

  it("shows a server error without navigating", async () => {
    loginActionMock.mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });
    const user = userEvent.setup({ delay: null });
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(toastMock.error).toHaveBeenCalledWith("Invalid credentials"),
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe("LoginForm — expired session notice", () => {
  it("explains why the user was bounced back", async () => {
    resetParams({ expired: "true" });
    render(<LoginForm />);

    await waitFor(() =>
      expect(toastMock.info).toHaveBeenCalledWith(
        "Session expired. Please log in again.",
      ),
    );
  });

  it("stays silent on a normal visit", () => {
    render(<LoginForm />);

    expect(toastMock.info).not.toHaveBeenCalled();
  });
});

describe("LoginForm — transient server messages", () => {
  const DISMISS_MS = 6000;

  // `shouldAdvanceTime` keeps the fake clock ticking with real time, which is
  // what lets RTL's waitFor/findBy polling resolve instead of deadlocking;
  // handing userEvent the same clock keeps its internal delays in step.
  function setupWithFakeTimers() {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears the login error once the timeout elapses", async () => {
    loginActionMock.mockResolvedValue({
      success: false,
      error: "Please verify your email address before logging in.",
    });
    const user = setupWithFakeTimers();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    const message = await screen.findByText(
      "Please verify your email address before logging in.",
    );
    expect(message).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(DISMISS_MS);
    });

    expect(
      screen.queryByText("Please verify your email address before logging in."),
    ).not.toBeInTheDocument();
  });

  it("drops the destructive field styling along with the error", async () => {
    loginActionMock.mockResolvedValue({
      success: false,
      error: "Invalid email or password.",
    });
    const user = setupWithFakeTimers();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    const email = screen.getByLabelText("Email Address");
    await waitFor(() => expect(email).toHaveAttribute("aria-invalid", "true"));

    await act(async () => {
      vi.advanceTimersByTime(DISMISS_MS);
    });

    expect(email).not.toHaveAttribute("aria-invalid");
  });

  it("clears the resend confirmation once the timeout elapses", async () => {
    loginActionMock.mockResolvedValue({
      success: false,
      error: "Please verify your email address before logging in.",
      data: { emailUnverified: true },
    });
    resendVerificationActionMock.mockResolvedValue({ success: true });
    const user = setupWithFakeTimers();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    const resendButton = await screen.findByRole("button", {
      name: "Resend verification email",
    });
    await user.click(resendButton);

    const notice = await screen.findByText(
      "If that account exists and is unverified, a new link is on its way.",
    );
    expect(notice).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(DISMISS_MS);
    });

    expect(
      screen.queryByText(
        "If that account exists and is unverified, a new link is on its way.",
      ),
    ).not.toBeInTheDocument();
  });
});

describe("LoginForm — unverified email recovery", () => {
  const RESEND_LABEL = "Resend verification email";

  async function submitLogin() {
    const user = userEvent.setup({ delay: null });
    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    return user;
  }

  it("offers a resend link once login reports the email is unverified", async () => {
    loginActionMock.mockResolvedValue({
      success: false,
      error: "Please verify your email address before logging in.",
      data: { emailUnverified: true },
    });
    render(<LoginForm />);

    await submitLogin();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: RESEND_LABEL }),
      ).toBeInTheDocument(),
    );
  });

  it("hides the resend link for ordinary credential failures", async () => {
    loginActionMock.mockResolvedValue({
      success: false,
      error: "Invalid email or password.",
      data: { emailUnverified: false },
    });
    render(<LoginForm />);

    await submitLogin();

    await waitFor(() => expect(toastMock.error).toHaveBeenCalled());
    expect(
      screen.queryByRole("button", { name: RESEND_LABEL }),
    ).not.toBeInTheDocument();
  });

  it("submits the email to the resend action and confirms it was sent", async () => {
    loginActionMock.mockResolvedValue({
      success: false,
      error: "Please verify your email address before logging in.",
      data: { emailUnverified: true },
    });
    resendVerificationActionMock.mockResolvedValue({ success: true });
    render(<LoginForm />);

    const user = await submitLogin();
    const resendButton = await screen.findByRole("button", {
      name: RESEND_LABEL,
    });
    await user.click(resendButton);

    await waitFor(() =>
      expect(resendVerificationActionMock).toHaveBeenCalled(),
    );

    const submittedForm = resendVerificationActionMock.mock.calls[0]?.[1] as
      FormData | undefined;
    expect(submittedForm?.get("email")).toBe("tobi@example.com");

    await waitFor(() =>
      expect(toastMock.success).toHaveBeenCalledWith(
        "Verification email sent. Please check your inbox.",
      ),
    );
  });
});
