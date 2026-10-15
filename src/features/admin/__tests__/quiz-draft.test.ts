import { describe, it, expect } from "vitest";
import { saveQuizSchema, type AdminQuiz } from "@gireapp/shared";
import {
  choiceLetter,
  draftFromQuiz,
  draftReducer,
  emptyDraft,
  isDirty,
  newQuestion,
  toSaveInput,
  type QuizDraft,
} from "@/features/admin/quiz-draft";

function draftWith(questions = [newQuestion()]): QuizDraft {
  return {
    ...emptyDraft(),
    courseId: "cmqjfipmm000bgoe9mne7uzhp",
    title: "Physics quiz",
    questions,
  };
}

function first(draft: QuizDraft) {
  const question = draft.questions[0];
  if (!question) throw new Error("expected a question");
  return question;
}

describe("emptyDraft", () => {
  it("starts with one question of four empty answers, as the design shows", () => {
    const draft = emptyDraft();

    expect(draft.questions).toHaveLength(1);
    expect(first(draft).choices).toHaveLength(4);
  });

  it("saves as a valid draft straight away, so an admin can save before finishing", () => {
    const input = toSaveInput(
      { ...emptyDraft(), courseId: "cmqjfipmm000bgoe9mne7uzhp", title: "Quiz" },
      false,
    );

    expect(saveQuizSchema.safeParse(input).success).toBe(true);
  });
});

describe("draftReducer", () => {
  it("marking an answer correct clears every other answer in that question", () => {
    let draft = draftWith();
    draft = draftReducer(draft, { type: "markCorrect", index: 0, choice: 1 });
    draft = draftReducer(draft, { type: "markCorrect", index: 0, choice: 3 });

    expect(first(draft).choices.map((choice) => choice.isCorrect)).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it("duplicates a question directly after itself with fresh keys", () => {
    let draft = draftWith();
    draft = draftReducer(draft, {
      type: "setQuestionText",
      index: 0,
      text: "Original?",
    });
    draft = draftReducer(draft, { type: "addQuestion" });
    draft = draftReducer(draft, { type: "duplicateQuestion", index: 0 });

    expect(draft.questions.map((question) => question.text)).toEqual([
      "Original?",
      "Original?",
      "",
    ]);
    expect(draft.questions[1]?.key).not.toBe(draft.questions[0]?.key);
    expect(draft.questions[1]?.choices[0]?.key).not.toBe(
      draft.questions[0]?.choices[0]?.key,
    );
  });

  it("removes the right question, keeping its neighbours' text", () => {
    let draft = draftWith([newQuestion(), newQuestion(), newQuestion()]);
    ["One?", "Two?", "Three?"].forEach((text, index) => {
      draft = draftReducer(draft, { type: "setQuestionText", index, text });
    });

    draft = draftReducer(draft, { type: "removeQuestion", index: 1 });

    expect(draft.questions.map((question) => question.text)).toEqual([
      "One?",
      "Three?",
    ]);
  });

  it("will not drop a question below two answers or grow it past six", () => {
    let draft = draftWith();
    for (let i = 0; i < 5; i += 1)
      draft = draftReducer(draft, {
        type: "removeChoice",
        index: 0,
        choice: 0,
      });
    expect(first(draft).choices).toHaveLength(2);

    for (let i = 0; i < 10; i += 1)
      draft = draftReducer(draft, { type: "addChoice", index: 0 });
    expect(first(draft).choices).toHaveLength(6);
  });

  it("ignores a duplicate request for a question that does not exist", () => {
    const draft = draftWith();

    expect(draftReducer(draft, { type: "duplicateQuestion", index: 9 })).toBe(
      draft,
    );
  });
});

describe("toSaveInput", () => {
  it("drops the React-only keys and turns blanks into nulls", () => {
    const input = toSaveInput(draftWith(), true);

    expect(JSON.stringify(input)).not.toContain('"key"');
    expect(input).toMatchObject({
      publish: true,
      description: null,
      difficulty: null,
    });
  });
});

describe("draftFromQuiz", () => {
  const quiz: AdminQuiz = {
    id: "quiz-1",
    courseId: "cmqjfipmm000bgoe9mne7uzhp",
    title: "SQL Basics",
    description: null,
    difficulty: null,
    timeLimitMin: 30,
    passingScore: 80,
    published: true,
    questions: [
      {
        text: "What does SELECT do?",
        explanation: "It reads rows.",
        points: 1,
        choices: [
          { text: "Reads rows", isCorrect: true },
          { text: "Deletes rows", isCorrect: false },
        ],
      },
    ],
    attemptCount: 0,
    updatedAt: "2026-10-01T12:00:00Z",
  };

  it("round-trips a stored quiz without losing anything — explanation included", () => {
    const input = toSaveInput(draftFromQuiz(quiz), quiz.published);

    expect(input.questions).toEqual(quiz.questions);
    expect(input.passingScore).toBe(80);
  });

  it("is not dirty straight after loading", () => {
    const draft = draftFromQuiz(quiz);

    // A second load mints different React keys; dirtiness must ignore them.
    expect(isDirty(draft, draftFromQuiz(quiz))).toBe(false);
  });

  it("becomes dirty after an edit", () => {
    const draft = draftFromQuiz(quiz);
    const edited = draftReducer(draft, {
      type: "setField",
      field: "title",
      value: "Renamed",
    });

    expect(isDirty(edited, draft)).toBe(true);
  });
});

describe("choiceLetter", () => {
  it("labels answers A, B, C … as the design does", () => {
    expect([0, 1, 2, 5].map(choiceLetter)).toEqual(["A", "B", "C", "F"]);
  });
});
