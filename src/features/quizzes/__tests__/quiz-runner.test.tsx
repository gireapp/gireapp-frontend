// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  LearnerQuizIntro,
  QuizResult,
  StartedQuiz,
} from "@gireapp/shared";

const { startMock, submitMock, toastMock } = vi.hoisted(() => ({
  startMock: vi.fn(),
  submitMock: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/features/quizzes/actions", () => ({
  startQuizAction: startMock,
  submitQuizAction: submitMock,
}));
vi.mock("sonner", () => ({ toast: toastMock }));

import { QuizRunner } from "@/features/quizzes/quiz-runner";

const INTRO: LearnerQuizIntro = {
  id: "cmquiz00000000000000000001",
  title: "Kinematics",
  description: "Motion in a straight line.",
  difficulty: "BEGINNER",
  timeLimitMin: 15,
  passingScore: 70,
  questionCount: 2,
  totalPoints: 6,
  course: { id: "cmcourse0000000000000001", title: "Foundations of Physics" },
  isEnrolled: true,
  history: { attemptCount: 0, bestScore: null, passed: false },
};

function started(expiresInMs = 15 * 60 * 1000): StartedQuiz {
  return {
    ticket: "signed-ticket",
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    questions: [
      {
        id: "q1",
        text: "What is velocity?",
        points: 1,
        choices: [
          { id: "q1-a", text: "Speed with direction" },
          { id: "q1-b", text: "Mass times speed" },
        ],
      },
      {
        id: "q2",
        text: "What is acceleration?",
        points: 5,
        choices: [
          { id: "q2-a", text: "Change in velocity over time" },
          { id: "q2-b", text: "Distance over time" },
        ],
      },
    ],
  };
}

const RESULT: QuizResult = {
  attemptId: "attempt-1",
  score: 83,
  passingScore: 70,
  passed: true,
  totalRight: 1,
  totalWrong: 1,
  pointsEarned: 50,
  badgeEarned: "SILVER",
  timeTakenSec: 247,
  review: [
    {
      questionId: "q1",
      text: "What is velocity?",
      points: 1,
      choices: [
        { id: "q1-a", text: "Speed with direction" },
        { id: "q1-b", text: "Mass times speed" },
      ],
      chosenChoiceId: "q1-b",
      correctChoiceId: "q1-a",
      isCorrect: false,
      explanation: "Velocity has a direction; speed does not.",
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  startMock.mockResolvedValue({ success: true, data: started() });
  submitMock.mockResolvedValue({ success: true, data: RESULT });
});

afterEach(() => vi.useRealTimers());

async function startQuiz() {
  render(<QuizRunner intro={INTRO} />);
  await userEvent.click(screen.getByRole("button", { name: "Start quiz" }));
  await screen.findByText("Question 1 of 2");
}

describe("QuizRunner — before starting", () => {
  it("states the time limit, pass mark and question count up front", () => {
    render(<QuizRunner intro={INTRO} />);

    expect(screen.getByText("15 min")).toBeTruthy();
    expect(screen.getByText("70%")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("sends a learner who has not enrolled to the course instead", () => {
    render(<QuizRunner intro={{ ...INTRO, isEnrolled: false }} />);

    expect(screen.queryByRole("button", { name: "Start quiz" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Go to course" }).getAttribute("href"),
    ).toBe("/dashboard/courses/cmcourse0000000000000001");
  });

  it("offers a retake and shows the best score once attempted", () => {
    render(
      <QuizRunner
        intro={{
          ...INTRO,
          history: { attemptCount: 2, bestScore: 60, passed: false },
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Retake quiz" })).toBeTruthy();
    expect(screen.getByText("60%")).toBeTruthy();
  });

  it("stays on the intro and says why when the quiz cannot start", async () => {
    startMock.mockResolvedValue({
      success: false,
      error: "Enrol in this course to take its quizzes.",
    });
    render(<QuizRunner intro={INTRO} />);

    await userEvent.click(screen.getByRole("button", { name: "Start quiz" }));

    await waitFor(() =>
      expect(toastMock.error).toHaveBeenCalledWith(
        "Enrol in this course to take its quizzes.",
      ),
    );
    expect(screen.queryByText("Question 1 of 2")).toBeNull();
  });
});

describe("QuizRunner — taking the quiz", () => {
  it("shows one question at a time with a running clock", async () => {
    await startQuiz();

    expect(screen.getByText("What is velocity?")).toBeTruthy();
    expect(screen.queryByText("What is acceleration?")).toBeNull();
    expect(screen.getByRole("timer").textContent).toMatch(/1[45]:\d\d/);
  });

  it("keeps an answer when moving away from a question and back", async () => {
    await startQuiz();

    await userEvent.click(screen.getByLabelText(/Mass times speed/));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(screen.getByLabelText(/Mass times speed/)).toHaveProperty(
      "checked",
      true,
    );
    expect(
      screen.getByRole("button", { name: "Question 1, answered" }),
    ).toBeTruthy();
  });

  it("jumps straight to a question from the navigator", async () => {
    await startQuiz();

    await userEvent.click(
      screen.getByRole("button", { name: "Question 2, not answered" }),
    );

    expect(screen.getByText("What is acceleration?")).toBeTruthy();
  });

  it("warns before submitting with questions unanswered, and respects a no", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await startQuiz();
    await userEvent.click(screen.getByLabelText(/Speed with direction/));

    await userEvent.click(
      screen.getByRole("button", { name: /Submit \(1\/2 answered\)/ }),
    );

    expect(confirm).toHaveBeenCalledWith(
      expect.stringContaining("1 question is unanswered"),
    );
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("submits the ticket and every answer given", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await startQuiz();
    await userEvent.click(screen.getByLabelText(/Mass times speed/));

    await userEvent.click(screen.getByRole("button", { name: /Submit/ }));

    await waitFor(() => expect(submitMock).toHaveBeenCalled());
    expect(submitMock).toHaveBeenCalledWith(INTRO.id, "signed-ticket", {
      q1: "q1-b",
    });
  });

  it("submits automatically when the clock reaches zero", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    startMock.mockResolvedValue({ success: true, data: started(3000) });
    await startQuiz();

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
  });

  it("goes back to the intro when the server says time ran out", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    submitMock.mockResolvedValue({
      success: false,
      error: "Time ran out before these answers arrived.",
      timeExpired: true,
    });
    await startQuiz();

    await userEvent.click(screen.getByRole("button", { name: /Submit/ }));

    expect(
      await screen.findByRole("button", { name: "Start quiz" }),
    ).toBeTruthy();
  });

  it("keeps the answers on screen after a network failure so the learner can retry", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    submitMock.mockResolvedValue({ success: false, error: "Network error." });
    await startQuiz();
    await userEvent.click(screen.getByLabelText(/Mass times speed/));

    await userEvent.click(screen.getByRole("button", { name: /Submit/ }));

    await waitFor(() => expect(toastMock.error).toHaveBeenCalled());
    expect(screen.getByLabelText(/Mass times speed/)).toHaveProperty(
      "checked",
      true,
    );
  });
});

describe("QuizRunner — the result", () => {
  async function finish() {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    await startQuiz();
    await userEvent.click(screen.getByRole("button", { name: /Submit/ }));
    await screen.findByText("You passed!");
  }

  it("shows the score, points, time and any badge unlocked", async () => {
    await finish();

    expect(screen.getByText("83%")).toBeTruthy();
    expect(screen.getByText("+50 points")).toBeTruthy();
    expect(screen.getByText("4 min 7 sec")).toBeTruthy();
    expect(screen.getByText("Silver badge unlocked")).toBeTruthy();
  });

  it("marks the learner's answer and the correct one, with the explanation", async () => {
    await finish();

    expect(screen.getByText("Your answer")).toBeTruthy();
    expect(screen.getByText("Correct answer")).toBeTruthy();
    expect(
      screen.getByText("Velocity has a direction; speed does not."),
    ).toBeTruthy();
  });

  it("explains a zero payout instead of showing +0", async () => {
    submitMock.mockResolvedValue({
      success: true,
      data: { ...RESULT, pointsEarned: 0 },
    });
    await finish();

    expect(screen.getByText(/No new points — already earned/)).toBeTruthy();
  });

  it("offers a retake from the result", async () => {
    await finish();

    await userEvent.click(screen.getByRole("button", { name: "Retake quiz" }));

    expect(screen.getByRole("button", { name: "Start quiz" })).toBeTruthy();
  });
});
