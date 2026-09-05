// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { changePasswordActionMock, endSessionMock } = vi.hoisted(() => ({
  changePasswordActionMock: vi.fn(),
  endSessionMock: vi.fn(),
}));

vi.mock("@/features/settings/actions", () => ({
  changePasswordAction: changePasswordActionMock,
  endChangedPasswordSession: endSessionMock,
}));

import { ChangePasswordForm } from "@/features/settings/change-password-form";

beforeEach(() => {
  vi.clearAllMocks();
  changePasswordActionMock.mockResolvedValue({ success: true });
});

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  values: { current: string; next: string; confirm: string },
) {
  await user.type(screen.getByLabelText("Current Password"), values.current);
  await user.type(screen.getByLabelText("New Password"), values.next);
  await user.type(screen.getByLabelText("Confirm Password"), values.confirm);
}

describe("ChangePasswordForm — the rules panel", () => {
  it("lists the rules the schema actually enforces", () => {
    render(<ChangePasswordForm />);

    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    expect(screen.getByText("At least one number")).toBeInTheDocument();
    expect(screen.getByText("Upper and lowercase letters")).toBeInTheDocument();
  });

  it("marks a rule as met only once the new password satisfies it", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const lengthRule = screen.getByText("At least 8 characters");
    const markBefore = lengthRule.previousElementSibling;
    expect(markBefore).toHaveClass("text-indigo-300");

    await user.type(screen.getByLabelText("New Password"), "LongEnough1");

    await waitFor(() => {
      expect(
        screen.getByText("At least 8 characters").previousElementSibling,
      ).toHaveClass("text-green-500");
    });
  });
});

describe("ChangePasswordForm — submitting", () => {
  it("sends all three fields to the action", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await fillForm(user, {
      current: "OldPassw0rd",
      next: "NewPassw0rd",
      confirm: "NewPassw0rd",
    });
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(changePasswordActionMock).toHaveBeenCalled());
    const formData = changePasswordActionMock.mock.calls[0][1] as FormData;
    expect(formData.get("currentPassword")).toBe("OldPassw0rd");
    expect(formData.get("password")).toBe("NewPassw0rd");
    expect(formData.get("confirmPassword")).toBe("NewPassw0rd");
  });

  it("keeps what was typed when the action rejects it", async () => {
    changePasswordActionMock.mockResolvedValue({
      success: false,
      errors: { currentPassword: ["That is not your current password"] },
    });
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await fillForm(user, {
      current: "WrongPass1",
      next: "NewPassw0rd",
      confirm: "NewPassw0rd",
    });
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(
        screen.getByText("That is not your current password"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Current Password")).toHaveValue("WrongPass1");
  });

  it("flags the field the error belongs to", async () => {
    changePasswordActionMock.mockResolvedValue({
      success: false,
      errors: { confirmPassword: ["Passwords do not match"] },
    });
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await fillForm(user, {
      current: "OldPassw0rd",
      next: "NewPassw0rd",
      confirm: "Different1",
    });
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Confirm Password")).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
    expect(screen.getByLabelText("Current Password")).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("prefers the field error over the generic envelope message", async () => {
    changePasswordActionMock.mockResolvedValue({
      success: false,
      error: "Validation failed.",
      errors: { currentPassword: ["That is not your current password"] },
    });
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await fillForm(user, {
      current: "WrongPass1",
      next: "NewPassw0rd",
      confirm: "NewPassw0rd",
    });
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(
        screen.getByText("That is not your current password"),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByText("Validation failed.")).not.toBeInTheDocument();
  });

  it("falls back to the envelope message when no field is named", async () => {
    changePasswordActionMock.mockResolvedValue({
      success: false,
      error: "Failed to change your password. Please try again.",
    });
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await fillForm(user, {
      current: "OldPassw0rd",
      next: "NewPassw0rd",
      confirm: "NewPassw0rd",
    });
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(
        screen.getByText("Failed to change your password. Please try again."),
      ).toBeInTheDocument(),
    );
  });
});

describe("ChangePasswordForm — after a successful change", () => {
  it("confirms the change and ends the session it just invalidated", async () => {
    const user = userEvent.setup({ delay: null });
    render(<ChangePasswordForm />);

    await fillForm(user, {
      current: "OldPassw0rd",
      next: "NewPassw0rd",
      confirm: "NewPassw0rd",
    });
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Password updated successfully/i,
    );
    await waitFor(() => expect(endSessionMock).toHaveBeenCalledTimes(1), {
      timeout: 4000,
    });
  });

  it("locks the form so the change cannot be replayed", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await fillForm(user, {
      current: "OldPassw0rd",
      next: "NewPassw0rd",
      confirm: "NewPassw0rd",
    });
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Save Changes" }),
      ).toBeDisabled(),
    );
    expect(screen.getByLabelText("Current Password")).toBeDisabled();
  });
});
