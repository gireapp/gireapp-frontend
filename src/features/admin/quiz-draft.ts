import type {
  AdminQuiz,
  QuizDifficulty,
  SaveQuizRequest,
} from "@gireapp/shared";
import { MAX_CHOICES, MIN_CHOICES } from "@gireapp/shared";

/**
 * The builder's in-memory quiz. Close to `SaveQuizInput`, plus a `key` on
 * each question and choice so React can track them through adds, deletes and
 * duplicates — array indexes would make a deleted question's text reappear in
 * its neighbour's input.
 */
export type DraftChoice = { key: string; text: string; isCorrect: boolean };

export type DraftQuestion = {
  key: string;
  text: string;
  explanation: string | null;
  points: number;
  choices: DraftChoice[];
};

export type QuizDraft = {
  courseId: string;
  title: string;
  description: string;
  difficulty: QuizDifficulty | "";
  timeLimitMin: number;
  passingScore: number;
  questions: DraftQuestion[];
};

/** The design shows four answers, A–D, on a new question. */
const NEW_QUESTION_CHOICES = 4;
const DEFAULT_POINTS = 1;
const DEFAULT_TIME_LIMIT_MIN = 30;
const DEFAULT_PASS_MARK = 70;

/*
 * A counter rather than `crypto.randomUUID()`: that only exists on secure
 * origins, so the builder would crash when opened over plain http on a LAN
 * address (how the app is tested on a phone). Keys only need to be unique
 * within this page.
 */
let nextKey = 0;
function newKey(prefix: string): string {
  nextKey += 1;
  return `${prefix}-${nextKey}`;
}

function newChoice(text = "", isCorrect = false): DraftChoice {
  return { key: newKey("choice"), text, isCorrect };
}

export function newQuestion(): DraftQuestion {
  return {
    key: newKey("question"),
    text: "",
    explanation: null,
    points: DEFAULT_POINTS,
    choices: Array.from({ length: NEW_QUESTION_CHOICES }, () => newChoice()),
  };
}

export function emptyDraft(): QuizDraft {
  return {
    courseId: "",
    title: "",
    description: "",
    difficulty: "",
    timeLimitMin: DEFAULT_TIME_LIMIT_MIN,
    passingScore: DEFAULT_PASS_MARK,
    questions: [newQuestion()],
  };
}

export function draftFromQuiz(quiz: AdminQuiz): QuizDraft {
  return {
    courseId: quiz.courseId,
    title: quiz.title,
    description: quiz.description ?? "",
    difficulty: quiz.difficulty ?? "",
    timeLimitMin: quiz.timeLimitMin,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map((question) => ({
      key: newKey("question"),
      text: question.text,
      explanation: question.explanation,
      points: question.points,
      choices: question.choices.map((choice) =>
        newChoice(choice.text, choice.isCorrect),
      ),
    })),
  };
}

/** Strips the React keys and shapes the draft for the shared save schema. */
export function toSaveInput(
  draft: QuizDraft,
  publish: boolean,
): SaveQuizRequest {
  return {
    courseId: draft.courseId,
    title: draft.title,
    description: draft.description.trim() || null,
    difficulty: draft.difficulty || null,
    timeLimitMin: draft.timeLimitMin,
    passingScore: draft.passingScore,
    publish,
    questions: draft.questions.map((question) => ({
      text: question.text,
      explanation: question.explanation,
      points: question.points,
      choices: question.choices.map(({ text, isCorrect }) => ({
        text,
        isCorrect,
      })),
    })),
  };
}

/** "A", "B", … — how the design labels answers. */
export function choiceLetter(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

// ── Reducer ──

type QuizSettings = Omit<QuizDraft, "questions">;

export type DraftAction =
  | {
      type: "setField";
      field: keyof QuizSettings;
      value: QuizSettings[keyof QuizSettings];
    }
  | { type: "addQuestion" }
  | { type: "duplicateQuestion"; index: number }
  | { type: "removeQuestion"; index: number }
  | { type: "setQuestionText"; index: number; text: string }
  | { type: "setPoints"; index: number; points: number }
  | { type: "setChoiceText"; index: number; choice: number; text: string }
  | { type: "markCorrect"; index: number; choice: number }
  | { type: "addChoice"; index: number }
  | { type: "removeChoice"; index: number; choice: number }
  | { type: "reset"; draft: QuizDraft };

function updateQuestion(
  draft: QuizDraft,
  index: number,
  change: (question: DraftQuestion) => DraftQuestion,
): QuizDraft {
  return {
    ...draft,
    questions: draft.questions.map((question, position) =>
      position === index ? change(question) : question,
    ),
  };
}

export function draftReducer(draft: QuizDraft, action: DraftAction): QuizDraft {
  switch (action.type) {
    case "setField":
      return { ...draft, [action.field]: action.value };

    case "addQuestion":
      return { ...draft, questions: [...draft.questions, newQuestion()] };

    case "duplicateQuestion": {
      const source = draft.questions[action.index];
      if (!source) return draft;
      // Fresh keys throughout, or React would treat the copy as the original.
      const copy: DraftQuestion = {
        ...source,
        key: newKey("question"),
        choices: source.choices.map((choice) =>
          newChoice(choice.text, choice.isCorrect),
        ),
      };
      const questions = [...draft.questions];
      questions.splice(action.index + 1, 0, copy);
      return { ...draft, questions };
    }

    case "removeQuestion":
      return {
        ...draft,
        questions: draft.questions.filter((_, index) => index !== action.index),
      };

    case "setQuestionText":
      return updateQuestion(draft, action.index, (question) => ({
        ...question,
        text: action.text,
      }));

    case "setPoints":
      return updateQuestion(draft, action.index, (question) => ({
        ...question,
        points: action.points,
      }));

    case "setChoiceText":
      return updateQuestion(draft, action.index, (question) => ({
        ...question,
        choices: question.choices.map((choice, index) =>
          index === action.choice ? { ...choice, text: action.text } : choice,
        ),
      }));

    case "markCorrect":
      // Single-answer questions: marking one clears the rest, so a question
      // can never end up with two correct answers through the UI.
      return updateQuestion(draft, action.index, (question) => ({
        ...question,
        choices: question.choices.map((choice, index) => ({
          ...choice,
          isCorrect: index === action.choice,
        })),
      }));

    case "addChoice":
      return updateQuestion(draft, action.index, (question) =>
        question.choices.length >= MAX_CHOICES
          ? question
          : { ...question, choices: [...question.choices, newChoice()] },
      );

    case "removeChoice":
      return updateQuestion(draft, action.index, (question) =>
        question.choices.length <= MIN_CHOICES
          ? question
          : {
              ...question,
              choices: question.choices.filter(
                (_, index) => index !== action.choice,
              ),
            },
      );

    case "reset":
      return action.draft;
  }
}

/** Whether the builder has unsaved edits, ignoring the React-only keys. */
export function isDirty(current: QuizDraft, saved: QuizDraft): boolean {
  return (
    JSON.stringify(toSaveInput(current, false)) !==
    JSON.stringify(toSaveInput(saved, false))
  );
}
