// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { resetPasswordActionMock, pushMock, searchParams, toastMock } =
  vi.hoisted(() => ({
    resetPasswordActionMock: vi.fn(),
    pushMock: vi.fn(),
    searchParams: new URLSearchParams(),
    toastMock: { success: vi.fn(), error: vi.fn() },
  }));

vi.mock("@/features/auth/actions", () => ({
  resetPasswordAction: resetPasswordActionMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParams,
}));

vi.mock("sonner", () => ({ toast: toastMock }));

import { ResetPasswordForm } from "@/features/auth/reset-password-form";

function setToken(token: string | null) {
  searchParams.delete("token");
  if (token !== null) searchParams.set("token", token);
}

beforeEach(() => {
  vi.clearAllMocks();
  setToken("reset-token-123");
  resetPasswordActionMock.mockResolvedValue({ success: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ResetPasswordForm — missing token", () => {
  it("refuses to render the form without a token", () => {
    setToken(null);
    render(<ResetPasswordForm />);

    expect(
      screen.getByText("This reset link is invalid or has expired."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("New Password")).not.toBeInTheDocument();
  });

  it("offers a way to request a fresh link", () => {
    setToken(null);
    render(<ResetPasswordForm />);

    expect(
      screen.getByRole("link", { name: "Request a new link" }),
    ).toHaveAttribute("href", "/forgot-password");
  });
});

describe("ResetPasswordForm — with a token", () => {
  it("renders both password fields", () => {
    render(<ResetPasswordForm />);

    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
  });

  it("carries the token through as a hidden field", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "NewPassw0rd");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "NewPassw0rd",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => expect(resetPasswordActionMock).toHaveBeenCalled());
    const formData = resetPasswordActionMock.mock.calls[0]?.[1] as FormData;
    expect(formData.get("token")).toBe("reset-token-123");
    expect(formData.get("password")).toBe("NewPassw0rd");
    expect(formData.get("confirmPassword")).toBe("NewPassw0rd");
  });

  it("masks passwords by default", () => {
    render(<ResetPasswordForm />);

    expect(screen.getByLabelText("New Password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("reveals and re-hides the new password independently", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ResetPasswordForm />);
    const field = screen.getByLabelText("New Password");

    await user.click(screen.getByRole("button", { name: "Show new password" }));
    expect(field).toHaveAttribute("type", "text");
    // The confirm field stays masked.
    expect(screen.getByLabelText("Confirm New Password")).toHaveAttribute(
      "type",
      "password",
    );

    await user.click(screen.getByRole("button", { name: "Hide new password" }));
    expect(field).toHaveAttribute("type", "password");
  });

  it("gives each password toggle a distinct accessible name", () => {
    render(<ResetPasswordForm />);

    expect(
      screen.getByRole("button", { name: "Show new password" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show confirm password" }),
    ).toBeInTheDocument();
  });

  it("surfaces field errors returned by the action", async () => {
    resetPasswordActionMock.mockResolvedValue({
      success: false,
      errors: { confirmPassword: ["Passwords do not match"] },
    });
    const user = userEvent.setup({ delay: null });
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "NewPassw0rd");
    await user.type(screen.getByLabelText("Confirm New Password"), "Different");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });

  it("confirms success and redirects to log in after the delay", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "NewPassw0rd");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "NewPassw0rd",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Password reset successfully/i,
    );
    await waitFor(() => expect(toastMock.success).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"), {
      timeout: 3000,
    });
  });

  it("disables the submit button once the reset has succeeded", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "NewPassw0rd");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "NewPassw0rd",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    await screen.findByRole("alert");
    expect(
      screen.getByRole("button", { name: "Reset password" }),
    ).toBeDisabled();
  });

  it("raises a toast when the action reports an error", async () => {
    resetPasswordActionMock.mockResolvedValue({
      success: false,
      error: "Reset link expired",
    });
    const user = userEvent.setup({ delay: null });
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "NewPassw0rd");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "NewPassw0rd",
    );
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() =>
      expect(toastMock.error).toHaveBeenCalledWith("Reset link expired"),
    );
  });
});
