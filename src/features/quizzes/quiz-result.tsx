"use client";

import Link from "next/link";
import { Award, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import { BADGE_THRESHOLDS, type QuizResult } from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { describeDuration } from "@/features/quizzes/quiz-timer";

const CHOICE_LETTER_START = "A".charCodeAt(0);

function letter(index: number): string {
  return String.fromCharCode(CHOICE_LETTER_START + index);
}

/**
 * Shown straight after submitting. The review is the point of a learning quiz,
 * so it lists every question with the learner's answer, the right one, and the
 * explanation where the author wrote one.
 */
export function QuizResultView({
  result,
  courseId,
  onRetake,
}: {
  result: QuizResult;
  courseId: string;
  onRetake: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section
        aria-labelledby="quiz-result-heading"
        className={cn(
          "flex flex-col items-center gap-4 rounded-2xl px-6 py-8 text-center",
          result.passed ? "bg-green-50" : "bg-indigo-100",
        )}
      >
        <h2
          id="quiz-result-heading"
          className="font-heading text-[22px] font-bold text-indigo-950"
        >
          {result.passed ? "You passed!" : "Not quite this time"}
        </h2>
        <p className="font-heading text-[56px] font-bold leading-none text-indigo-950">
          {result.score}%
        </p>
        <p className="font-sans text-[15px] text-indigo-800">
          {result.totalRight} of {result.totalRight + result.totalWrong} correct
          · pass mark {result.passingScore}%
        </p>

        <ul className="flex flex-wrap justify-center gap-3">
          <Stat icon={Award}>
            {result.pointsEarned > 0
              ? `+${result.pointsEarned} points`
              : "No new points — already earned on this quiz"}
          </Stat>
          <Stat icon={Clock}>{describeDuration(result.timeTakenSec)}</Stat>
          {result.badgeEarned && (
            <Stat icon={Award} highlight>
              {BADGE_THRESHOLDS[result.badgeEarned].label} badge unlocked
            </Stat>
          )}
        </ul>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onRetake}
            className="flex h-11 items-center gap-2 rounded-lg border border-indigo-800 px-5 font-sans text-[15px] font-medium text-indigo-950 transition-colors hover:bg-indigo-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Retake quiz
          </button>
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="flex h-11 items-center rounded-lg bg-coral-500 px-5 font-sans text-[15px] font-medium text-indigo-50 transition-colors hover:bg-coral-600"
          >
            Back to course
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="quiz-review-heading"
        className="flex flex-col gap-4"
      >
        <h2
          id="quiz-review-heading"
          className="font-heading text-[18px] font-bold text-indigo-950"
        >
          Review your answers
        </h2>

        <ol className="flex flex-col gap-4">
          {result.review.map((item, index) => (
            <li
              key={item.questionId}
              className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 md:p-6"
            >
              <div className="flex items-start gap-3">
                {item.isCorrect ? (
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
                    aria-label="Correct"
                  />
                ) : (
                  <XCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                    aria-label="Incorrect"
                  />
                )}
                <p className="font-sans text-[16px] font-medium text-indigo-950">
                  {index + 1}. {item.text}
                </p>
              </div>

              <ul className="flex flex-col gap-2 pl-8">
                {item.choices.map((choice, choiceIndex) => {
                  const isRight = choice.id === item.correctChoiceId;
                  const isPicked = choice.id === item.chosenChoiceId;
                  return (
                    <li
                      key={choice.id}
                      className={cn(
                        "flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 font-sans text-[15px]",
                        isRight && "bg-green-100 text-green-900",
                        isPicked && !isRight && "bg-red-100 text-red-900",
                        !isRight && !isPicked && "text-indigo-800",
                      )}
                    >
                      <span className="font-medium">
                        {letter(choiceIndex)}.
                      </span>
                      <span>{choice.text}</span>
                      {isRight && <Tag>Correct answer</Tag>}
                      {isPicked && <Tag>Your answer</Tag>}
                    </li>
                  );
                })}
                {item.chosenChoiceId === null && (
                  <li className="px-3 font-sans text-[14px] text-red-700">
                    Not answered
                  </li>
                )}
              </ul>

              {item.explanation && (
                <p className="rounded-lg bg-indigo-100 px-4 py-3 font-sans text-[14px] text-indigo-900">
                  {item.explanation}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  highlight = false,
  children,
}: {
  icon: typeof Award;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 font-sans text-[14px]",
        highlight
          ? "bg-coral-500 text-indigo-50"
          : "bg-indigo-50 text-indigo-900",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </li>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-white/70 px-2 py-0.5 font-sans text-[12px] font-medium">
      {children}
    </span>
  );
}
