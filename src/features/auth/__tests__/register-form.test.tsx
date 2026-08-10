// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { registerActionMock, toastMock } = vi.hoisted(() => ({
  registerActionMock: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/features/auth/actions", () => ({
  registerAction: registerActionMock,
}));

vi.mock("sonner", () => ({ toast: toastMock }));

import { RegisterForm } from "@/features/auth/register-form";

const ADULT_DOB = "1990-01-01";

function minorDob(): string {
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 15);
  return dob.toISOString().slice(0, 10);
}

/** Fills step 1 and advances to the track picker. */
async function completeStepOne(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { dateOfBirth?: string; guardianEmail?: string } = {},
) {
  await user.type(screen.getByLabelText("Full Name"), "Tobi Ojo");
  await user.type(screen.getByLabelText("Email Address"), "tobi@example.com");
  await user.type(screen.getByLabelText("Password"), "Passw0rdd");
  await user.type(screen.getByLabelText("Confirm Password"), "Passw0rdd");

  const dob = screen.getByLabelText("Date of Birth");
  await user.clear(dob);
  await user.type(dob, overrides.dateOfBirth ?? ADULT_DOB);

  if (overrides.guardianEmail) {
    await user.type(
      await screen.findByLabelText("Guardian's Email"),
      overrides.guardianEmail,
    );
  }

  await user.click(screen.getByRole("button", { name: "Create Account" }));
}

async function selectTrack(
  user: ReturnType<typeof userEvent.setup>,
  track: string,
) {
  await user.click(
    await screen.findByRole("button", { name: new RegExp(track) }),
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  registerActionMock.mockResolvedValue({ success: false });
});

describe("RegisterForm — step 1", () => {
  it("renders the account fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Date of Birth")).toBeInTheDocument();
  });

  it("shows the step heading from the desktop design", () => {
    render(<RegisterForm />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Create your account" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Join GIREAPP and start your personalized learning journey",
      ),
    ).toBeInTheDocument();
  });

  it("hides the guardian email field for adults", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);

    const dob = screen.getByLabelText("Date of Birth");
    await user.clear(dob);
    await user.type(dob, ADULT_DOB);

    expect(screen.queryByLabelText("Guardian's Email")).not.toBeInTheDocument();
  });

  it("reveals the guardian email field once the date of birth is under 18", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);

    const dob = screen.getByLabelText("Date of Birth");
    await user.clear(dob);
    await user.type(dob, minorDob());

    expect(
      await screen.findByLabelText("Guardian's Email"),
    ).toBeInTheDocument();
  });

  it("blocks progress while required fields are empty", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Create your account" }),
    ).toBeInTheDocument();
  });

  it("flags mismatched passwords", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Password"), "Passw0rdd");
    await user.type(screen.getByLabelText("Confirm Password"), "Different1");
    await user.tab();

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
  });

  it("advances to the track picker when step 1 is valid", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);

    await completeStepOne(user);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Choose your learning track",
      }),
    ).toBeInTheDocument();
  });
});

describe("RegisterForm — step 2 track picker", () => {
  it("offers all three tracks", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);

    expect(await screen.findByText("Secondary")).toBeInTheDocument();
    expect(screen.getByText("Tertiary")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();
  });

  it("refuses to continue until a track is chosen", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);

    await user.click(await screen.findByRole("button", { name: "Continue" }));

    expect(toastMock.error).toHaveBeenCalledWith(
      "Please select a track to continue.",
    );
  });

  it("can step back to the account details", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);

    await user.click(await screen.findByRole("button", { name: "Go back" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Create your account",
      }),
    ).toBeInTheDocument();
  });
});

describe("RegisterForm — step 3 department options follow the track", () => {
  async function departmentOptions(): Promise<string[]> {
    const select = await screen.findByLabelText("Department");
    return within(select)
      .getAllByRole("option")
      .map((option) => option.textContent ?? "")
      .filter((label) => label !== "Select Department");
  }

  it("offers the shared SECONDARY departments", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);
    await selectTrack(user, "Secondary");

    expect(await departmentOptions()).toEqual(["Science", "Business", "Arts"]);
  });

  it("offers the shared TERTIARY departments", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);
    await selectTrack(user, "Tertiary");

    expect(await departmentOptions()).toEqual([
      "Undergraduate",
      "Postgraduate",
    ]);
  });

  it("offers the shared PROFESSIONAL departments", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);
    await selectTrack(user, "Professional");

    expect(await departmentOptions()).toEqual([
      "Data Analytics",
      "Project Management",
      "Digital Marketing",
      "Software Engineering",
    ]);
  });

  it("never offers a department the onboarding schema would reject", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);
    await selectTrack(user, "Secondary");

    const options = await departmentOptions();
    expect(options).not.toContain("Commercial");
    expect(options).not.toContain("Technology");
    expect(options).not.toContain("Arts / Humanities");
  });

  it("marks the area of focus optional", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);
    await selectTrack(user, "Secondary");

    expect(
      await screen.findByLabelText("Area of focus (optional)"),
    ).toBeInTheDocument();
  });

  it("requires department and class before continuing", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);
    await selectTrack(user, "Secondary");

    await user.click(await screen.findByRole("button", { name: "Continue" }));

    expect(toastMock.error).toHaveBeenCalledWith(
      "Please select your department and class/level to continue.",
    );
  });

  it("continues without an area of focus", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await completeStepOne(user);
    await selectTrack(user, "Secondary");

    await user.selectOptions(
      await screen.findByLabelText("Department"),
      "Science",
    );
    await user.selectOptions(screen.getByLabelText("Class / Level"), "SS3");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText(/You’re all set/)).toBeInTheDocument();
  });
});

describe("RegisterForm — step 4 summary", () => {
  async function reachSummary(user: ReturnType<typeof userEvent.setup>) {
    await completeStepOne(user);
    await selectTrack(user, "Secondary");
    await user.selectOptions(
      await screen.findByLabelText("Department"),
      "Science",
    );
    await user.selectOptions(screen.getByLabelText("Class / Level"), "SS3");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByText(/You’re all set/);
  }

  it("greets the user by first name in caps", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await reachSummary(user);

    expect(screen.getByText("You’re all set, TOBI!")).toBeInTheDocument();
  });

  it("summarises the chosen track and department", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await reachSummary(user);

    expect(screen.getByText("Track: Secondary")).toBeInTheDocument();
    expect(screen.getByText("Department: Science")).toBeInTheDocument();
    expect(screen.getByText("Class: SS3")).toBeInTheDocument();
  });

  it("omits the area of focus row when none was chosen", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await reachSummary(user);

    expect(screen.queryByText(/^Area of focus:/)).not.toBeInTheDocument();
  });

  it("uses the design's Edit and Go to dashboard labels", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await reachSummary(user);

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to dashboard" }),
    ).toBeInTheDocument();
  });

  it("Edit returns to the customization step", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await reachSummary(user);

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Customize your path",
      }),
    ).toBeInTheDocument();
  });

  it("submits every collected field to the action", async () => {
    const user = userEvent.setup({ delay: null });
    render(<RegisterForm />);
    await reachSummary(user);

    await user.click(screen.getByRole("button", { name: "Go to dashboard" }));

    await waitFor(() => expect(registerActionMock).toHaveBeenCalled());
    const formData = registerActionMock.mock.calls[0]?.[1] as FormData;
    expect(formData.get("name")).toBe("Tobi Ojo");
    expect(formData.get("email")).toBe("tobi@example.com");
    expect(formData.get("track")).toBe("Secondary");
    expect(formData.get("department")).toBe("Science");
    expect(formData.get("level")).toBe("SS3");
    expect(formData.get("dateOfBirth")).toBe(ADULT_DOB);
  });
});
