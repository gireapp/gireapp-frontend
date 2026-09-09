// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { updateNameMock, refreshMock } = vi.hoisted(() => ({
  updateNameMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/features/settings/actions", () => ({
  updateNameAction: updateNameMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { UpdateNameForm } from "@/features/settings/update-name-form";

const CURRENT = "Afolabi Hassan";

beforeEach(() => {
  vi.clearAllMocks();
  updateNameMock.mockResolvedValue({ success: true });
});

describe("UpdateNameForm — before anything changes", () => {
  it("starts from the name already on the account", () => {
    render(<UpdateNameForm currentName={CURRENT} />);

    expect(screen.getByLabelText("Full Name")).toHaveValue(CURRENT);
  });

  it("has nothing to save until the name differs", () => {
    render(<UpdateNameForm currentName={CURRENT} />);

    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  });

  it("does not count added padding as a change", async () => {
    const user = userEvent.setup();
    render(<UpdateNameForm currentName={CURRENT} />);

    await user.type(screen.getByLabelText("Full Name"), "   ");

    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  });

  it("says where the name is used", () => {
    render(<UpdateNameForm currentName={CURRENT} />);

    expect(
      screen.getByText(/shown on your dashboard, your certificates/i),
    ).toBeInTheDocument();
  });
});

describe("UpdateNameForm — saving", () => {
  it("submits the edited name", async () => {
    const user = userEvent.setup();
    render(<UpdateNameForm currentName={CURRENT} />);

    const field = screen.getByLabelText("Full Name");
    await user.clear(field);
    await user.type(field, "Afolabi H. Gozie");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(updateNameMock).toHaveBeenCalled());
    const call = updateNameMock.mock.calls[0];
    if (!call) throw new Error("the action was never called");
    expect((call[1] as FormData).get("name")).toBe("Afolabi H. Gozie");
  });

  it("refreshes the shell, which greets the learner by name", async () => {
    const user = userEvent.setup();
    render(<UpdateNameForm currentName={CURRENT} />);

    const field = screen.getByLabelText("Full Name");
    await user.clear(field);
    await user.type(field, "Afolabi H. Gozie");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Name updated successfully/i,
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("names a rejected value beside the field and in the panel", async () => {
    updateNameMock.mockResolvedValue({
      success: false,
      errors: { name: ["Name must be at least 2 characters"] },
    });
    const user = userEvent.setup();
    render(<UpdateNameForm currentName={CURRENT} />);

    const field = screen.getByLabelText("Full Name");
    await user.clear(field);
    await user.type(field, "A");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Full Name")).toHaveAttribute(
        "aria-invalid",
        "true",
      ),
    );
    expect(
      screen.getAllByText("Name must be at least 2 characters"),
    ).toHaveLength(2);
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
