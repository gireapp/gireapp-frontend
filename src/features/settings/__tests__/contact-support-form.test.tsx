// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { contactSupportMock } = vi.hoisted(() => ({
  contactSupportMock: vi.fn(),
}));

vi.mock("@/features/settings/actions", () => ({
  contactSupportAction: contactSupportMock,
}));

import { ContactSupportForm } from "@/features/settings/contact-support-form";

const REPLY_TO = "afolabi@example.com";
const SUBJECT = "Cannot open my quiz";
const MESSAGE =
  "The quiz page has been loading forever since yesterday evening.";

beforeEach(() => {
  vi.clearAllMocks();
  contactSupportMock.mockResolvedValue({ success: true });
});

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Subject"), SUBJECT);
  await user.type(screen.getByLabelText("Message"), MESSAGE);
}

describe("ContactSupportForm — before sending", () => {
  it("says where the reply will go", () => {
    render(<ContactSupportForm replyTo={REPLY_TO} />);

    expect(screen.getByText(`We reply to ${REPLY_TO}.`)).toBeInTheDocument();
  });

  it("starts at the middle urgency, as the schema defaults", () => {
    render(<ContactSupportForm replyTo={REPLY_TO} />);

    expect(screen.getByRole("button", { name: /Medium/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("never asks for a name or address — the account supplies them", () => {
    render(<ContactSupportForm replyTo={REPLY_TO} />);

    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });
});

describe("ContactSupportForm — sending", () => {
  it("submits the subject, message and chosen urgency", async () => {
    const user = userEvent.setup();
    render(<ContactSupportForm replyTo={REPLY_TO} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /High/ }));
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(contactSupportMock).toHaveBeenCalled());
    const call = contactSupportMock.mock.calls[0];
    if (!call) throw new Error("the action was never called");
    const formData = call[1] as FormData;
    expect(formData.get("subject")).toBe(SUBJECT);
    expect(formData.get("message")).toBe(MESSAGE);
    expect(formData.get("urgency")).toBe("high");
  });

  it("confirms delivery and names where the reply goes", async () => {
    const user = userEvent.setup();
    render(<ContactSupportForm replyTo={REPLY_TO} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Message sent successfully/i,
    );
    expect(
      screen.getByText(`We will write back to ${REPLY_TO}.`),
    ).toBeInTheDocument();
  });

  it("locks the form so one problem is not reported twice", async () => {
    const user = userEvent.setup();
    render(<ContactSupportForm replyTo={REPLY_TO} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Send message" }),
      ).toBeDisabled(),
    );
    expect(screen.getByLabelText("Subject")).toBeDisabled();
  });

  it("names a rejected field beside it and in the panel", async () => {
    contactSupportMock.mockResolvedValue({
      success: false,
      errors: {
        message: ["Please provide more detail (at least 20 characters)"],
      },
    });
    const user = userEvent.setup();
    render(<ContactSupportForm replyTo={REPLY_TO} />);

    await user.type(screen.getByLabelText("Subject"), SUBJECT);
    await user.type(screen.getByLabelText("Message"), "broken");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Message")).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
    expect(
      screen.getAllByText(
        "Please provide more detail (at least 20 characters)",
      ),
    ).toHaveLength(2);
  });

  it("keeps the form open when the message could not be sent", async () => {
    // Nothing is stored, so a failure means the request did not happen.
    contactSupportMock.mockResolvedValue({
      success: false,
      error: "Could not send your message. Please try again.",
    });
    const user = userEvent.setup();
    render(<ContactSupportForm replyTo={REPLY_TO} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Could not send your message/i,
    );
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
    expect(screen.getByLabelText("Message")).toHaveValue(MESSAGE);
  });
});
