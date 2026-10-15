"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileQuestion,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import type {
  LearnerQuizIntro,
  QuizResult,
  StartedQuiz,
} from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { startQuizAction, submitQuizAction } from "@/features/quizzes/actions";
import { QuizResultView } from "@/features/quizzes/quiz-result";
import {
  describeDuration,
  formatClock,
  remainingSeconds,
} from "@/features/quizzes/quiz-timer";

const TICK_MS = 1000;
/** The clock turns red for the final minute. */
const LOW_TIME_SEC = 60;
const CHOICE_LETTER_START = "A".charCodeAt(0);

type Phase =
  | { name: "intro" }
  | { name: "taking"; started: StartedQuiz }
  | { name: "result"; result: QuizResult };

const PRIMARY_BUTTON =
  "flex h-11 items-center justify-center gap-2 rounded-lg bg-coral-500 px-5 font-sans text-[15px] font-medium text-indigo-50 transition-colors hover:bg-coral-600 disabled:opacity-60";
const SECONDARY_BUTTON =
  "flex h-11 items-center justify-center gap-2 rounded-lg border border-indigo-800 px-5 font-sans text-[15px] font-medium text-indigo-950 transition-colors hover:bg-indigo-50 disabled:opacity-40";

export function QuizRunner({ intro }: { intro: LearnerQuizIntro }) {
  const [phase, setPhase] = useState<Phase>({ name: "intro" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const start = () => {
    startTransition(async () => {
      const response = await startQuizAction(intro.id);
      if (!response.success || !response.data) {
        toast.error(response.error ?? "The quiz could not be started.");
        return;
      }
      setAnswers({});
      setIndex(0);
      setPhase({ name: "taking", started: response.data });
    });
  };

  // Guards the auto-submit at zero from firing twice, and a click racing it.
  const submittingRef = useRef(false);

  const submit = useCallback(
    (started: StartedQuiz, sheet: Record<string, string>) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      startTransition(async () => {
        const response = await submitQuizAction(
          intro.id,
          started.ticket,
          sheet,
        );
        submittingRef.current = false;

        if (response.success && response.data) {
          setPhase({ name: "result", result: response.data });
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        toast.error(response.error ?? "Your answers could not be submitted.");
        // An expired ticket cannot be retried; anything else keeps the
        // answers on screen so the learner can try again.
        if (response.timeExpired) setPhase({ name: "intro" });
      });
    },
    [intro.id],
  );

  if (phase.name === "result") {
    return (
      <QuizResultView
        result={phase.result}
        courseId={intro.course.id}
        onRetake={() => setPhase({ name: "intro" })}
      />
    );
  }

  if (phase.name === "taking") {
    return (
      <QuizInProgress
        intro={intro}
        started={phase.started}
        answers={answers}
        index={index}
        submitting={isPending}
        onAnswer={(questionId, choiceId) =>
          setAnswers((current) => ({ ...current, [questionId]: choiceId }))
        }
        onNavigate={setIndex}
        onSubmit={(sheet) => submit(phase.started, sheet)}
      />
    );
  }

  return <QuizIntro intro={intro} starting={isPending} onStart={start} />;
}

// ── Intro ──

function QuizIntro({
  intro,
  starting,
  onStart,
}: {
  intro: LearnerQuizIntro;
  starting: boolean;
  onStart: () => void;
}) {
  const { history } = intro;

  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-indigo-100 p-6 md:p-8">
      {intro.description && (
        <p className="font-sans text-[16px] text-indigo-900">
          {intro.description}
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-3">
        <Fact icon={FileQuestion} label="Questions">
          {intro.questionCount}
        </Fact>
        <Fact icon={Clock} label="Time limit">
          {intro.timeLimitMin} min
        </Fact>
        <Fact icon={Trophy} label="Pass mark">
          {intro.passingScore}%
        </Fact>
      </ul>

      {history.attemptCount > 0 && (
        <p className="font-sans text-[15px] text-indigo-900">
          Best score so far: <strong>{history.bestScore}%</strong>
          {history.passed ? " — passed" : ""} · {history.attemptCount}{" "}
          {history.attemptCount === 1 ? "attempt" : "attempts"}
        </p>
      )}

      <p className="font-sans text-[14px] text-indigo-800">
        The timer starts when you press Start and keeps running if you leave the
        page. When it reaches zero your answers are submitted automatically.
      </p>

      {intro.isEnrolled ? (
        <button
          type="button"
          onClick={onStart}
          disabled={starting}
          className={cn(PRIMARY_BUTTON, "self-start")}
        >
          {starting
            ? "Starting…"
            : history.attemptCount > 0
              ? "Retake quiz"
              : "Start quiz"}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="font-sans text-[15px] text-indigo-900">
            Enrol in {intro.course.title} to take this quiz.
          </p>
          <Link
            href={`/dashboard/courses/${intro.course.id}`}
            className={cn(PRIMARY_BUTTON, "self-start")}
          >
            Go to course
          </Link>
        </div>
      )}
    </section>
  );
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-indigo-800" aria-hidden="true" />
      <span className="flex flex-col">
        <span className="font-sans text-[13px] text-indigo-800">{label}</span>
        <span className="font-heading text-[18px] font-bold text-indigo-950">
          {children}
        </span>
      </span>
    </li>
  );
}

// ── Taking the quiz ──

function QuizInProgress({
  intro,
  started,
  answers,
  index,
  submitting,
  onAnswer,
  onNavigate,
  onSubmit,
}: {
  intro: LearnerQuizIntro;
  started: StartedQuiz;
  answers: Record<string, string>;
  index: number;
  submitting: boolean;
  onAnswer: (questionId: string, choiceId: string) => void;
  onNavigate: (index: number) => void;
  onSubmit: (sheet: Record<string, string>) => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    remainingSeconds(started.expiresAt),
  );
  const questions = started.questions;
  const question = questions[index];
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const isLast = index === questions.length - 1;

  // Read the latest answers and callback from the timer without restarting
  // it every time an answer is picked.
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  useEffect(() => {
    const tick = () => {
      const left = remainingSeconds(started.expiresAt);
      setSecondsLeft(left);
      if (left === 0) onSubmitRef.current(answersRef.current);
    };
    const timer = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(timer);
  }, [started.expiresAt]);

  // Leaving mid-quiz loses the answers; the browser should ask first.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const confirmAndSubmit = () => {
    const unanswered = questions.length - answeredCount;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered} ${unanswered === 1 ? "question is" : "questions are"} unanswered and will be marked wrong. Submit anyway?`,
      )
    ) {
      return;
    }
    onSubmit(answers);
  };

  if (!question) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Sticky so the clock stays in view while a long question scrolls. */}
      <div className="sticky top-2 z-10 flex items-center justify-between gap-4 rounded-xl bg-indigo-800 px-4 py-3 text-indigo-50 md:top-4">
        <span className="font-sans text-[15px]">
          Question {index + 1} of {questions.length}
        </span>
        <span
          role="timer"
          aria-label={`${describeDuration(secondsLeft)} left`}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1 font-mono text-[16px] font-bold tabular-nums",
            secondsLeft <= LOW_TIME_SEC ? "bg-red-600" : "bg-indigo-950/40",
          )}
        >
          <Clock className="h-4 w-4" aria-hidden="true" />
          {formatClock(secondsLeft)}
        </span>
      </div>

      <fieldset
        key={question.id}
        className="flex min-w-0 flex-col gap-4 rounded-2xl bg-indigo-100 p-5 md:p-8"
      >
        <legend className="sr-only">
          Question {index + 1}: {question.text}
        </legend>
        <p className="font-heading text-[18px] font-bold text-indigo-950 md:text-[20px]">
          {question.text}
        </p>
        <p className="font-sans text-[13px] text-indigo-800">
          {question.points} {question.points === 1 ? "point" : "points"}
        </p>

        <div className="flex flex-col gap-3">
          {question.choices.map((choice, choiceIndex) => {
            const checked = answers[question.id] === choice.id;
            return (
              <label
                key={choice.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 font-sans text-[16px] transition-colors",
                  checked
                    ? "border-indigo-800 bg-indigo-50 text-indigo-950"
                    : "border-transparent bg-indigo-50/60 text-indigo-900 hover:border-indigo-300",
                )}
              >
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  value={choice.id}
                  checked={checked}
                  disabled={submitting}
                  onChange={() => onAnswer(question.id, choice.id)}
                  className="h-5 w-5 shrink-0 accent-indigo-800"
                />
                <span className="font-medium">
                  {String.fromCharCode(CHOICE_LETTER_START + choiceIndex)}.
                </span>
                <span className="min-w-0 break-words">{choice.text}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <nav aria-label="Questions" className="flex flex-wrap gap-2">
        {questions.map((q, position) => (
          <button
            key={q.id}
            type="button"
            onClick={() => onNavigate(position)}
            aria-label={`Question ${position + 1}${answers[q.id] ? ", answered" : ", not answered"}`}
            aria-current={position === index ? "step" : undefined}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg font-sans text-[14px] font-medium transition-colors",
              position === index && "ring-2 ring-coral-500 ring-offset-2",
              answers[q.id]
                ? "bg-indigo-800 text-indigo-50"
                : "bg-indigo-100 text-indigo-900 hover:bg-indigo-200",
            )}
          >
            {position + 1}
          </button>
        ))}
      </nav>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => onNavigate(index - 1)}
          disabled={index === 0 || submitting}
          className={SECONDARY_BUTTON}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {!isLast && (
            <button
              type="button"
              onClick={() => onNavigate(index + 1)}
              disabled={submitting}
              className={SECONDARY_BUTTON}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {/* Submit is always reachable, so a learner who is done early is
              never forced to click through to the last question. */}
          <button
            type="button"
            onClick={confirmAndSubmit}
            disabled={submitting}
            className={PRIMARY_BUTTON}
          >
            {submitting
              ? "Submitting…"
              : `Submit (${answeredCount}/${questions.length} answered)`}
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {intro.title}: {answeredCount} of {questions.length} answered
      </p>
    </div>
  );
}
