// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AdminQuiz } from "@gireapp/shared";

const { saveMock, replaceMock, toastMock } = vi.hoisted(() => ({
  saveMock: vi.fn(),
  replaceMock: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/admin/quiz-actions", () => ({ saveQuizAction: saveMock }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));
vi.mock("sonner", () => ({ toast: toastMock }));

import { QuizBuilder } from "@/features/admin/quiz-builder";

const COURSES = [
  {
    id: "cmqjfipmm000bgoe9mne7uzhp",
    title: "Foundations of Physics",
    academicLevel: "SECONDARY" as const,
  },
  {
    id: "cmqjfipmm000bgoe9mne7aaaa",
    title: "Data Analytics for Business",
    academicLevel: "PROFESSIONAL" as const,
  },
];

function storedQuiz(over: Partial<AdminQuiz> = {}): AdminQuiz {
  return {
    id: "cmquiz00000000000000000001",
    courseId: "cmqjfipmm000bgoe9mne7uzhp",
    title: "Kinematics Quiz",
    description: null,
    difficulty: "INTERMEDIATE",
    timeLimitMin: 15,
    passingScore: 70,
    published: false,
    questions: [
      {
        text: "What is velocity?",
        explanation: null,
        points: 1,
        choices: [
          { text: "Speed with direction", isCorrect: true },
          { text: "Mass times speed", isCorrect: false },
        ],
      },
    ],
    attemptCount: 0,
    updatedAt: "2026-10-01T12:00:00Z",
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  saveMock.mockImplementation(
    async (_id: string | null, input: { publish: boolean }) => ({
      success: true,
      data: storedQuiz({
        id: "cmquiz00000000000000000099",
        published: input.publish,
      }),
    }),
  );
});

describe("QuizBuilder — a new quiz", () => {
  it("narrows the subjects to the chosen track", async () => {
    render(<QuizBuilder quiz={null} courses={COURSES} />);

    await userEvent.selectOptions(
      screen.getByLabelText("Learning Track"),
      "PROFESSIONAL",
    );

    const subjects = within(screen.getByLabelText("Subject")).getAllByRole(
      "option",
    );
    expect(subjects.map((option) => option.textContent)).toEqual([
      "Choose…",
      "Data Analytics for Business",
    ]);
  });

  it("clears a chosen subject when the track changes away from it", async () => {
    render(<QuizBuilder quiz={null} courses={COURSES} />);
    await userEvent.selectOptions(
      screen.getByLabelText("Subject"),
      "cmqjfipmm000bgoe9mne7uzhp",
    );

    await userEvent.selectOptions(
      screen.getByLabelText("Learning Track"),
      "PROFESSIONAL",
    );

    expect(screen.getByLabelText("Subject")).toHaveProperty("value", "");
  });

  it("saves a draft, then moves to the quiz's own URL so the next save updates it", async () => {
    render(<QuizBuilder quiz={null} courses={COURSES} />);
    await userEvent.type(
      screen.getByLabelText(/Quiz title/),
      "Electromagnetism",
    );
    await userEvent.selectOptions(
      screen.getByLabelText("Subject"),
      "cmqjfipmm000bgoe9mne7uzhp",
    );

    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(saveMock).toHaveBeenCalledTimes(1));
    expect(saveMock.mock.calls[0]?.[0]).toBeNull();
    expect(saveMock.mock.calls[0]?.[1]).toMatchObject({
      publish: false,
      title: "Electromagnetism",
    });
    expect(replaceMock).toHaveBeenCalledWith(
      "/admin/quizzes/cmquiz00000000000000000099",
    );
  });

  it("shows server errors against the question they belong to", async () => {
    saveMock.mockResolvedValue({
      success: false,
      error: "Fix the highlighted fields and try again.",
      errors: {
        "questions.0.choices": [
          "Mark exactly one correct answer for question 1",
        ],
      },
    });
    render(<QuizBuilder quiz={null} courses={COURSES} />);

    await userEvent.click(
      screen.getAllByRole("button", { name: /Publish quiz/ })[0] as HTMLElement,
    );

    expect(
      await screen.findByText("Mark exactly one correct answer for question 1"),
    ).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain(
      "1 thing needs fixing",
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

describe("QuizBuilder — editing", () => {
  it("updates the existing quiz rather than creating another", async () => {
    render(<QuizBuilder quiz={storedQuiz()} courses={COURSES} />);

    await userEvent.click(
      screen.getAllByRole("button", { name: /Publish quiz/ })[0] as HTMLElement,
    );

    await waitFor(() => expect(saveMock).toHaveBeenCalled());
    expect(saveMock.mock.calls[0]?.[0]).toBe("cmquiz00000000000000000001");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("starts on the stored quiz's track and subject", () => {
    render(<QuizBuilder quiz={storedQuiz()} courses={COURSES} />);

    expect(screen.getByLabelText("Learning Track")).toHaveProperty(
      "value",
      "SECONDARY",
    );
    expect(screen.getByLabelText("Subject")).toHaveProperty(
      "value",
      "cmqjfipmm000bgoe9mne7uzhp",
    );
  });

  it("offers Move to drafts and Save changes once a quiz is published", () => {
    render(
      <QuizBuilder quiz={storedQuiz({ published: true })} courses={COURSES} />,
    );

    expect(screen.getByRole("button", { name: "Move to drafts" })).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /Save changes/ }).length,
    ).toBeGreaterThan(0);
  });

  it("explains a missing difficulty on a quiz published before difficulty existed", () => {
    render(
      <QuizBuilder
        quiz={storedQuiz({ published: true, difficulty: null })}
        courses={COURSES}
      />,
    );

    expect(
      screen.getByText(/published before difficulty existed/i),
    ).toBeTruthy();
  });

  it("locks the questions once learners have sat the quiz, but not the settings", () => {
    render(
      <QuizBuilder quiz={storedQuiz({ attemptCount: 3 })} courses={COURSES} />,
    );

    expect(
      screen.getByText(/3 learners have already sat this quiz/),
    ).toBeTruthy();
    expect(screen.getByLabelText("Question 1")).toHaveProperty(
      "readOnly",
      true,
    );
    expect(screen.queryByRole("button", { name: "Add question" })).toBeNull();
    expect(screen.getByLabelText(/Quiz title/)).toHaveProperty(
      "readOnly",
      false,
    );
  });

  it("enables Discard changes only once something has changed, and restores the saved quiz", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<QuizBuilder quiz={storedQuiz()} courses={COURSES} />);
    const discard = screen.getByRole("button", { name: "Discard changes" });
    expect(discard).toHaveProperty("disabled", true);

    const title = screen.getByLabelText(/Quiz title/);
    await userEvent.clear(title);
    await userEvent.type(title, "Something else");
    expect(discard).toHaveProperty("disabled", false);

    await userEvent.click(discard);

    expect(title).toHaveProperty("value", "Kinematics Quiz");
  });

  it("does not offer to delete the only question", () => {
    render(<QuizBuilder quiz={storedQuiz()} courses={COURSES} />);

    expect(
      screen.getByRole("button", { name: "Delete question 1" }),
    ).toHaveProperty("disabled", true);
  });
});
