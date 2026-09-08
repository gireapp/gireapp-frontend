// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { updateEmailActionMock } = vi.hoisted(() => ({
  updateEmailActionMock: vi.fn(),
}));

vi.mock("@/features/settings/actions", () => ({
  updateEmailAction: updateEmailActionMock,
}));

import { UpdateEmailForm } from "@/features/settings/update-email-form";

const CURRENT = "old@example.com";

beforeEach(() => {
  vi.clearAllMocks();
  updateEmailActionMock.mockResolvedValue({ success: true });
});

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  next: string,
  confirm = next,
) {
  await user.type(screen.getByLabelText("New Email"), next);
  await user.type(screen.getByLabelText("Confirm Email"), confirm);
}

describe("UpdateEmailForm — before submitting", () => {
  it("shows the current address without offering to edit it", () => {
    render(<UpdateEmailForm currentEmail={CURRENT} />);

    expect(screen.getByText(CURRENT)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(CURRENT)).not.toBeInTheDocument();
  });

  it("says up front where the verification link will go", () => {
    render(<UpdateEmailForm currentEmail={CURRENT} />);

    expect(
      screen.getByText(/send a verification link to your new email address/i),
    ).toBeInTheDocument();
  });
});

describe("UpdateEmailForm — submitting", () => {
  it("sends both addresses to the action", async () => {
    const user = userEvent.setup();
    render(<UpdateEmailForm currentEmail={CURRENT} />);

    await fillForm(user, "new@example.com");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(updateEmailActionMock).toHaveBeenCalled());
    const call = updateEmailActionMock.mock.calls[0];
    if (!call) throw new Error("the action was never called");
    const formData = call[1] as FormData;
    expect(formData.get("newEmail")).toBe("new@example.com");
    expect(formData.get("confirmEmail")).toBe("new@example.com");
  });

  it("reaches the action even though the address is malformed, so the schema decides", async () => {
    updateEmailActionMock.mockResolvedValue({
      success: false,
      errors: { newEmail: ["Please enter a valid email address"] },
    });
    const user = userEvent.setup();
    render(<UpdateEmailForm currentEmail={CURRENT} />);

    await fillForm(user, "afolabihassanchigo.com");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(updateEmailActionMock).toHaveBeenCalled());
  });

  it("names the reason under the offending field and flags it", async () => {
    updateEmailActionMock.mockResolvedValue({
      success: false,
      errors: { newEmail: ["Please enter a valid email address"] },
    });
    const user = userEvent.setup();
    render(<UpdateEmailForm currentEmail={CURRENT} />);

    await fillForm(user, "not-an-email");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(screen.getByLabelText("New Email")).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
    // Once beside the field, once in the status panel.
    expect(
      screen.getAllByText("Please enter a valid email address"),
    ).toHaveLength(2);
    expect(screen.getByLabelText("Confirm Email")).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("surfaces an address another account already holds", async () => {
    updateEmailActionMock.mockResolvedValue({
      success: false,
      errors: { newEmail: ["That email address is already in use"] },
    });
    const user = userEvent.setup();
    render(<UpdateEmailForm currentEmail={CURRENT} />);

    await fillForm(user, "taken@example.com");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(
        screen.getAllByText("That email address is already in use").length,
      ).toBeGreaterThan(0),
    );
  });
});

describe("UpdateEmailForm — after the request is accepted", () => {
  it("confirms the link was sent and names where it went", async () => {
    const user = userEvent.setup();
    render(<UpdateEmailForm currentEmail={CURRENT} />);

    await fillForm(user, "new@example.com");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Verification email sent successfully/i,
    );
    expect(
      screen.getByText(/Nothing changes until you open the link sent to/i),
    ).toHaveTextContent("new@example.com");
  });

  it("locks the form so the request is not sent twice", async () => {
    const user = userEvent.setup();
    render(<UpdateEmailForm currentEmail={CURRENT} />);

    await fillForm(user, "new@example.com");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Save Changes" }),
      ).toBeDisabled(),
    );
    expect(screen.getByLabelText("New Email")).toBeDisabled();
  });
});
