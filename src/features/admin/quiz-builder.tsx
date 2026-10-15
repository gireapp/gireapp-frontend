"use client";

import { useEffect, useReducer, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
import {
  ACADEMIC_LEVELS,
  QUIZ_DIFFICULTIES,
  QUIZ_PASS_MARK_OPTIONS,
  QUIZ_TIME_LIMIT_OPTIONS,
  type AdminQuiz,
  type QuizDifficulty,
} from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { FILTER_CONTROL_CLASSNAME } from "@/features/admin/filter-select";
import { TRACK_LABELS } from "@/features/admin/track-labels";
import type { CourseOption } from "@/features/admin/students";
import { saveQuizAction } from "@/features/admin/quiz-actions";
import {
  FieldError,
  QuizQuestionCard,
} from "@/features/admin/quiz-question-card";
import {
  draftFromQuiz,
  draftReducer,
  emptyDraft,
  isDirty,
  toSaveInput,
  type QuizDraft,
} from "@/features/admin/quiz-draft";

const DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const PRIMARY_BUTTON_CLASSNAME =
  "flex h-10 items-center gap-2 rounded bg-coral-500 px-4 font-sans text-[14px] font-medium text-indigo-50 transition-colors hover:bg-coral-600 disabled:opacity-60";
const SECONDARY_BUTTON_CLASSNAME =
  "flex h-10 items-center gap-2 rounded border border-indigo-500 px-4 font-sans text-[14px] font-medium text-indigo-950 transition-colors hover:bg-indigo-100 disabled:opacity-60";
const LABEL_CLASSNAME = "font-sans text-[14px] font-medium text-indigo-950";

export function QuizBuilder({
  quiz,
  courses,
}: {
  /** Null when creating a new quiz. */
  quiz: AdminQuiz | null;
  courses: CourseOption[];
}) {
  const router = useRouter();
  const initial = quiz ? draftFromQuiz(quiz) : emptyDraft();
  const [draft, dispatch] = useReducer(draftReducer, initial);
  const [saved, setSaved] = useState<QuizDraft>(initial);
  const [published, setPublished] = useState(quiz?.published ?? false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);

  const locked = (quiz?.attemptCount ?? 0) > 0;
  const dirty = isDirty(draft, saved);
  const selectedCourse = courses.find((course) => course.id === draft.courseId);
  const [track, setTrack] = useState(selectedCourse?.academicLevel ?? "");
  const subjects = track
    ? courses.filter((course) => course.academicLevel === track)
    : courses;

  // Leaving with unsaved edits should not silently throw them away.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = (publish: boolean) => {
    startTransition(async () => {
      const result = await saveQuizAction(
        quiz?.id ?? null,
        toSaveInput(draft, publish),
      );

      if (!result.success || !result.data) {
        setErrors(result.errors ?? {});
        toast.error(result.error ?? "The quiz could not be saved.");
        summaryRef.current?.focus();
        return;
      }

      setErrors({});
      setSaved(draft);
      setPublished(result.data.published);
      toast.success(result.data.published ? "Quiz published" : "Draft saved");

      // A new quiz now has an id; move to its own URL so the next save
      // updates it rather than creating a second copy.
      if (!quiz) router.replace(`/admin/quizzes/${result.data.id}`);
    });
  };

  const discard = () => {
    if (window.confirm("Discard every change since the last save?")) {
      dispatch({ type: "reset", draft: saved });
      setTrack(
        courses.find((c) => c.id === saved.courseId)?.academicLevel ?? "",
      );
      setErrors({});
    }
  };

  const changeTrack = (value: string) => {
    setTrack(value);
    // A subject from another track would silently survive the switch.
    if (selectedCourse && value && selectedCourse.academicLevel !== value) {
      dispatch({ type: "setField", field: "courseId", value: "" });
    }
  };

  const errorCount = Object.values(errors).flat().length;
  const legacyWithoutDifficulty =
    published && !draft.difficulty && quiz !== null;

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[24px] font-bold text-indigo-950 md:text-[28px]">
            {quiz ? "Edit quiz" : "Quiz Builder"}
          </h1>
          <p className="font-sans text-[16px] text-indigo-400">
            Create engaging quizzes for learners
          </p>
          <p className="font-sans text-[13px] text-indigo-800">
            {published
              ? "Published — visible to learners"
              : "Draft — not visible to learners"}
            {dirty && " · Unsaved changes"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => save(false)}
            className={SECONDARY_BUTTON_CLASSNAME}
          >
            {published ? "Move to drafts" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => save(true)}
            className={PRIMARY_BUTTON_CLASSNAME}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {published ? "Save changes" : "Publish quiz"}
          </button>
        </div>
      </header>

      <div
        ref={summaryRef}
        tabIndex={-1}
        role={errorCount > 0 ? "alert" : undefined}
        className="focus:outline-none"
      >
        {errorCount > 0 && (
          <p className="rounded border border-red-600 bg-red-50 px-4 py-3 font-sans text-[14px] text-red-700">
            {errorCount === 1
              ? "1 thing needs fixing before this can be saved."
              : `${errorCount} things need fixing before this can be saved.`}{" "}
            {errors._form?.join(" ")}
          </p>
        )}
      </div>

      {locked && (
        <p className="rounded bg-indigo-100 px-4 py-3 font-sans text-[14px] text-indigo-800">
          {quiz?.attemptCount === 1
            ? "1 learner has"
            : `${quiz?.attemptCount} learners have`}{" "}
          already sat this quiz, so its questions are locked. You can still
          change its settings or move it to drafts.
        </p>
      )}

      <section className="flex flex-col gap-6 rounded-lg bg-indigo-100 p-4 md:p-6">
        <h2 className="font-heading text-[18px] font-bold text-indigo-950">
          Quiz Information
        </h2>

        <div className="flex flex-col gap-2">
          <label htmlFor="quiz-title" className={LABEL_CLASSNAME}>
            Quiz title <span aria-hidden="true">*</span>
          </label>
          <input
            id="quiz-title"
            value={draft.title}
            required
            placeholder="e.g. Physics - Electromagnetism Quiz"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "quiz-title-error" : undefined}
            onChange={(event) =>
              dispatch({
                type: "setField",
                field: "title",
                value: event.target.value,
              })
            }
            className={cn(
              FILTER_CONTROL_CLASSNAME,
              "w-full font-normal placeholder:text-indigo-400",
              errors.title && "border-red-600",
            )}
          />
          <FieldError id="quiz-title-error" messages={errors.title} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="quiz-track" label="Learning Track">
            <select
              id="quiz-track"
              value={track}
              onChange={(event) => changeTrack(event.target.value)}
              className={cn(FILTER_CONTROL_CLASSNAME, "w-full pr-8")}
            >
              <option value="">All tracks</option>
              {ACADEMIC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {TRACK_LABELS[level]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="quiz-difficulty"
            label="Difficulty"
            errors={errors.difficulty}
          >
            <select
              id="quiz-difficulty"
              value={draft.difficulty}
              aria-invalid={errors.difficulty ? true : undefined}
              onChange={(event) =>
                dispatch({
                  type: "setField",
                  field: "difficulty",
                  value: event.target.value as QuizDifficulty | "",
                })
              }
              className={cn(
                FILTER_CONTROL_CLASSNAME,
                "w-full pr-8",
                errors.difficulty && "border-red-600",
              )}
            >
              <option value="">Choose…</option>
              {QUIZ_DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {DIFFICULTY_LABELS[difficulty]}
                </option>
              ))}
            </select>
            {legacyWithoutDifficulty && !errors.difficulty && (
              <p className="font-sans text-[13px] text-indigo-800">
                This quiz was published before difficulty existed. Choose one to
                save changes.
              </p>
            )}
          </Field>

          {/* "Subject" in the design is the course: "Physics" is the
              Foundations of Physics course, not a department. */}
          <Field id="quiz-subject" label="Subject" errors={errors.courseId}>
            <select
              id="quiz-subject"
              value={draft.courseId}
              aria-invalid={errors.courseId ? true : undefined}
              onChange={(event) =>
                dispatch({
                  type: "setField",
                  field: "courseId",
                  value: event.target.value,
                })
              }
              className={cn(
                FILTER_CONTROL_CLASSNAME,
                "w-full pr-8",
                errors.courseId && "border-red-600",
              )}
            >
              <option value="">
                {subjects.length === 0
                  ? "No subjects in this track"
                  : "Choose…"}
              </option>
              {subjects.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </Field>

          <Field id="quiz-time" label="Time limit" errors={errors.timeLimitMin}>
            <select
              id="quiz-time"
              value={draft.timeLimitMin}
              onChange={(event) =>
                dispatch({
                  type: "setField",
                  field: "timeLimitMin",
                  value: Number(event.target.value),
                })
              }
              className={cn(FILTER_CONTROL_CLASSNAME, "w-full pr-8")}
            >
              {QUIZ_TIME_LIMIT_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} mins
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="quiz-pass-mark"
            label="Pass Mark"
            errors={errors.passingScore}
          >
            <select
              id="quiz-pass-mark"
              value={draft.passingScore}
              onChange={(event) =>
                dispatch({
                  type: "setField",
                  field: "passingScore",
                  value: Number(event.target.value),
                })
              }
              className={cn(FILTER_CONTROL_CLASSNAME, "w-full pr-8")}
            >
              {QUIZ_PASS_MARK_OPTIONS.map((percent) => (
                <option key={percent} value={percent}>
                  {percent}%
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="quiz-description"
          label="Description (optional)"
          errors={errors.description}
        >
          <textarea
            id="quiz-description"
            value={draft.description}
            rows={4}
            onChange={(event) =>
              dispatch({
                type: "setField",
                field: "description",
                value: event.target.value,
              })
            }
            className="w-full rounded border border-indigo-800 bg-transparent px-3 py-2 font-sans text-[16px] text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-6 rounded-lg bg-indigo-100 p-4 md:p-6">
        <h2 className="font-heading text-[18px] font-bold text-indigo-950">
          Questions
        </h2>
        <FieldError id="quiz-questions-error" messages={errors.questions} />

        <ol className="flex flex-col gap-4">
          {draft.questions.map((question, index) => (
            <QuizQuestionCard
              key={question.key}
              question={question}
              index={index}
              total={draft.questions.length}
              errors={errors}
              locked={locked}
              dispatch={dispatch}
            />
          ))}
        </ol>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={isPending}
          onClick={() => save(true)}
          className={PRIMARY_BUTTON_CLASSNAME}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {published ? "Save changes" : "Publish quiz"}
        </button>

        <div className="flex flex-wrap gap-3">
          {!locked && (
            <button
              type="button"
              onClick={() => dispatch({ type: "addQuestion" })}
              className={SECONDARY_BUTTON_CLASSNAME}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add question
            </button>
          )}
          <button
            type="button"
            disabled={!dirty || isPending}
            onClick={discard}
            className={SECONDARY_BUTTON_CLASSNAME}
          >
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  errors,
  children,
}: {
  id: string;
  label: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className={LABEL_CLASSNAME}>
        {label}
      </label>
      {children}
      <FieldError id={`${id}-error`} messages={errors} />
    </div>
  );
}
