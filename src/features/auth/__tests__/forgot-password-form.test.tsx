// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { forgotPasswordActionMock } = vi.hoisted(() => ({
  forgotPasswordActionMock: vi.fn(),
}));

vi.mock("@/features/auth/actions", () => ({
  forgotPasswordAction: forgotPasswordActionMock,
}));

import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

beforeEach(() => {
  vi.clearAllMocks();
  forgotPasswordActionMock.mockResolvedValue({ success: true });
});

describe("ForgotPasswordForm", () => {
  it("renders an email field and the submit button", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send reset link" }),
    ).toBeInTheDocument();
  });

  it("offers a route back to log in", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("submits the typed email to the server action", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => expect(forgotPasswordActionMock).toHaveBeenCalled());
    const formData = forgotPasswordActionMock.mock.calls[0]?.[1] as FormData;
    expect(formData.get("email")).toBe("tobi@example.com");
  });

  it("shows the neutral confirmation banner on success", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /If an account exists with that email/i,
    );
  });

  it("surfaces a field error returned by the action", async () => {
    forgotPasswordActionMock.mockResolvedValue({
      success: false,
      errors: { email: ["Please enter a valid email address"] },
    });
    const user = userEvent.setup({ delay: null });
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(
      await screen.findByText("Please enter a valid email address"),
    ).toBeInTheDocument();
  });

  it("links the error to the input for assistive tech", async () => {
    forgotPasswordActionMock.mockResolvedValue({
      success: false,
      errors: { email: ["Please enter a valid email address"] },
    });
    const user = userEvent.setup({ delay: null });
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email Address"), "x@y.z");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    await screen.findByText("Please enter a valid email address");
    const input = screen.getByLabelText("Email Address");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "forgot-email-error");
  });

  it("shows a top-level error when the action reports one", async () => {
    forgotPasswordActionMock.mockResolvedValue({
      success: false,
      error: "Something went wrong",
    });
    const user = userEvent.setup({ delay: null });
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });
});
