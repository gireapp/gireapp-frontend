// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { loginActionMock, pushMock, refreshMock, searchParams, toastMock } =
  vi.hoisted(() => ({
    loginActionMock: vi.fn(),
    pushMock: vi.fn(),
    refreshMock: vi.fn(),
    searchParams: new URLSearchParams(),
    toastMock: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  }));

vi.mock("@/features/auth/actions", () => ({ loginAction: loginActionMock }));

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
