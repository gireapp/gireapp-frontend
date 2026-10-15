"use client";

import { Copy, Plus, Trash2, X } from "lucide-react";
import {
  MAX_CHOICES,
  MIN_CHOICES,
  QUESTION_POINT_OPTIONS,
} from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { FILTER_CONTROL_CLASSNAME } from "@/features/admin/filter-select";
import {
  choiceLetter,
  type DraftAction,
  type DraftQuestion,
} from "@/features/admin/quiz-draft";

const ICON_BUTTON_CLASSNAME =
  "flex h-10 w-10 items-center justify-center rounded text-indigo-800 transition-colors hover:bg-indigo-100 disabled:opacity-40 disabled:hover:bg-transparent";

export function FieldError({
  id,
  messages,
}: {
  id: string;
  messages?: string[];
}) {
  if (!messages || messages.length === 0) return null;
  return (
    <p id={id} className="font-sans text-[13px] text-red-600">
      {messages.join(" ")}
    </p>
  );
}

/**
 * Figma "Frame 352" — one question with its answers. Duplicate and Delete sit
 * on the card itself rather than in the design's shared bottom bar: with more
 * than one question, a bar-level "Delete" leaves the reader guessing which
 * question it acts on.
 */
export function QuizQuestionCard({
  question,
  index,
  total,
  errors,
  locked,
  dispatch,
}: {
  question: DraftQuestion;
  index: number;
  total: number;
  errors: Record<string, string[]>;
  /** Learners have sat this quiz, so its questions are read-only. */
  locked: boolean;
  dispatch: (action: DraftAction) => void;
}) {
  const number = index + 1;
  const textId = `${question.key}-text`;
  const textErrorId = `${question.key}-text-error`;
  const choicesErrorId = `${question.key}-choices-error`;
  const textErrors = errors[`questions.${index}.text`];
  const choiceErrors = errors[`questions.${index}.choices`];

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-10 items-center justify-center rounded border border-indigo-800 font-sans text-[16px] font-medium text-indigo-950"
          >
            {number}
          </span>
          {/* Only single-answer multiple choice exists, so this is a label
              rather than a select with one option in it. */}
          <span className="font-sans text-[16px] font-medium text-indigo-950">
            Multiple choice
          </span>
        </div>

        <div className="flex items-center gap-1">
          <select
            aria-label={`Points for question ${number}`}
            value={question.points}
            disabled={locked}
            onChange={(event) =>
              dispatch({
                type: "setPoints",
                index,
                points: Number(event.target.value),
              })
            }
            className={cn(FILTER_CONTROL_CLASSNAME, "w-[104px] pr-8")}
          >
            {QUESTION_POINT_OPTIONS.map((points) => (
              <option key={points} value={points}>
                {points} {points === 1 ? "pt" : "pts"}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label={`Duplicate question ${number}`}
            disabled={locked}
            onClick={() => dispatch({ type: "duplicateQuestion", index })}
            className={ICON_BUTTON_CLASSNAME}
          >
            <Copy className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete question ${number}`}
            disabled={locked || total === 1}
            onClick={() => dispatch({ type: "removeQuestion", index })}
            className={ICON_BUTTON_CLASSNAME}
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={textId} className="sr-only">
          Question {number}
        </label>
        <input
          id={textId}
          value={question.text}
          readOnly={locked}
          placeholder="Type the question"
          aria-invalid={textErrors ? true : undefined}
          aria-describedby={textErrors ? textErrorId : undefined}
          onChange={(event) =>
            dispatch({
              type: "setQuestionText",
              index,
              text: event.target.value,
            })
          }
          className={cn(
            FILTER_CONTROL_CLASSNAME,
            "w-full font-normal placeholder:text-indigo-400",
            textErrors && "border-red-600",
          )}
        />
        <FieldError id={textErrorId} messages={textErrors} />
      </div>

      {/* `min-w-0`: browsers give a fieldset `min-width: min-content`, so
          without it the answer rows refuse to shrink and their Correct badge
          and remove buttons are pushed off a phone screen. */}
      <fieldset
        className="flex min-w-0 flex-col gap-3"
        aria-describedby={choiceErrors ? choicesErrorId : undefined}
      >
        <legend className="sr-only">
          Answers for question {number} — choose the correct one
        </legend>

        {question.choices.map((choice, choiceIndex) => {
          const letter = choiceLetter(choiceIndex);
          const inputId = `${choice.key}-text`;

          return (
            <div
              key={choice.key}
              className={cn(
                "flex items-center gap-3 rounded px-2 py-1",
                choice.isCorrect && "bg-indigo-100",
              )}
            >
              <input
                type="radio"
                name={`${question.key}-correct`}
                checked={choice.isCorrect}
                disabled={locked}
                aria-label={`Mark answer ${letter} as correct`}
                onChange={() =>
                  dispatch({ type: "markCorrect", index, choice: choiceIndex })
                }
                className="h-6 w-6 shrink-0 accent-indigo-800"
              />
              <label
                htmlFor={inputId}
                className="w-5 shrink-0 font-sans text-[16px] font-medium text-indigo-950"
              >
                {letter}.
              </label>
              <input
                id={inputId}
                value={choice.text}
                readOnly={locked}
                placeholder={`Answer ${letter}`}
                onChange={(event) =>
                  dispatch({
                    type: "setChoiceText",
                    index,
                    choice: choiceIndex,
                    text: event.target.value,
                  })
                }
                className="h-10 min-w-0 flex-1 rounded border border-indigo-300 bg-transparent px-3 font-sans text-[15px] text-indigo-950 placeholder:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {/* Hidden on phones, where it squeezes the answer to a few
                  characters; the filled radio and highlighted row already say
                  which answer is correct, and the radio's checked state is
                  what a screen reader announces. */}
              {choice.isCorrect && (
                <span
                  aria-hidden="true"
                  className="hidden shrink-0 rounded bg-green-500 px-2 py-1 font-sans text-[13px] text-indigo-50 sm:inline-flex"
                >
                  Correct
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove answer ${letter}`}
                disabled={locked || question.choices.length <= MIN_CHOICES}
                onClick={() =>
                  dispatch({ type: "removeChoice", index, choice: choiceIndex })
                }
                className={cn(ICON_BUTTON_CLASSNAME, "h-8 w-8")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}

        <FieldError id={choicesErrorId} messages={choiceErrors} />

        {!locked && question.choices.length < MAX_CHOICES && (
          <button
            type="button"
            onClick={() => dispatch({ type: "addChoice", index })}
            className="flex items-center gap-2 self-start font-sans text-[14px] text-indigo-800 hover:underline"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add answer
          </button>
        )}
      </fieldset>
    </li>
  );
}
