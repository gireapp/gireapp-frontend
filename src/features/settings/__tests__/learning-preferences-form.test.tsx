// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { updatePreferencesMock, refreshMock } = vi.hoisted(() => ({
  updatePreferencesMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("@/features/settings/actions", () => ({
  updateLearningPreferencesAction: updatePreferencesMock,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { LearningPreferencesForm } from "@/features/settings/learning-preferences-form";

beforeEach(() => {
  vi.clearAllMocks();
  updatePreferencesMock.mockResolvedValue({ success: true });
});

function renderForm(
  overrides: Partial<React.ComponentProps<typeof LearningPreferencesForm>> = {},
) {
  render(
    <LearningPreferencesForm
      academicLevel="SECONDARY"
      department="Science"
      moodTheme="focused"
      {...overrides}
    />,
  );
}

describe("LearningPreferencesForm — what it starts from", () => {
  it("shows the track, department and mood already on the account", () => {
    renderForm();

    expect(screen.getByRole("button", { name: /Secondary/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Science" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Focused/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("offers only the departments that belong to the chosen track", () => {
    renderForm();

    expect(
      screen.getByRole("button", { name: "Business" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Postgraduate" }),
    ).not.toBeInTheDocument();
  });

  it("asks for a track first when the account has none", () => {
    renderForm({ academicLevel: null, department: null });

    expect(
      screen.getByText("Choose a learning track first."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  });
});

describe("LearningPreferencesForm — switching track", () => {
  it("swaps in that track's departments", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Tertiary/ }));

    expect(
      screen.getByRole("button", { name: "Undergraduate" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Science" }),
    ).not.toBeInTheDocument();
  });

  it("clears the department, which only means something within its track", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Professional/ }));

    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();
  });

  it("restores the saved department when the original track is chosen again", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Tertiary/ }));
    await user.click(screen.getByRole("button", { name: /Secondary/ }));

    expect(screen.getByRole("button", { name: "Science" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("LearningPreferencesForm — saving", () => {
  it("submits the three fields the onboarding endpoint expects", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /Relaxed/ }));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(updatePreferencesMock).toHaveBeenCalled());
    const call = updatePreferencesMock.mock.calls[0];
    if (!call) throw new Error("the action was never called");
    const formData = call[1] as FormData;
    expect(formData.get("academicLevel")).toBe("SECONDARY");
    expect(formData.get("department")).toBe("Science");
    expect(formData.get("moodTheme")).toBe("relaxed");
  });

  it("refreshes the shell, which routes on the track it just changed", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(await screen.findByRole("status")).toHaveTextContent(
      /Preferences saved/i,
    );
  });

  it("surfaces a rejected pairing rather than claiming success", async () => {
    updatePreferencesMock.mockResolvedValue({
      success: false,
      errors: {
        department: ["Selected department does not match your academic level"],
      },
    });
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /does not match your academic level/i,
    );
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
