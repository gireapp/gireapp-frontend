"use client";

import { useEffect, useReducer, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ACADEMIC_LEVELS,
  DEPARTMENTS,
  type AcademicLevel,
  type AdminCourse,
} from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { FILTER_CONTROL_CLASSNAME } from "@/features/admin/filter-select";
import { TRACK_LABELS } from "@/features/admin/track-labels";
import { FieldError } from "@/features/admin/quiz-question-card";
import { LessonEditor } from "@/features/admin/lesson-editor";
import { saveCourseAction } from "@/features/admin/course-actions";
import {
  courseReducer,
  draftFromCourse,
  emptyCourseDraft,
  isCourseDirty,
  moduleHasProgress,
  toSaveInput,
  type CourseDraft,
} from "@/features/admin/course-draft";

const PRIMARY_BUTTON =
  "flex h-10 items-center gap-2 rounded bg-coral-500 px-4 font-sans text-[14px] font-medium text-indigo-50 transition-colors hover:bg-coral-600 disabled:opacity-60";
const SECONDARY_BUTTON =
  "flex h-10 items-center gap-2 rounded border border-indigo-500 px-4 font-sans text-[14px] font-medium text-indigo-950 transition-colors hover:bg-indigo-100 disabled:opacity-60";
const ICON_BUTTON =
  "flex h-9 w-9 items-center justify-center rounded text-indigo-800 transition-colors hover:bg-indigo-200 disabled:opacity-40 disabled:hover:bg-transparent";
const LABEL = "font-sans text-[14px] font-medium text-indigo-950";

/*
 * No Figma frame exists for course management; this follows Quiz Builder's
 * layout and behaviour so the two admin editors work the same way.
 */
export function CourseBuilder({ course }: { course: AdminCourse | null }) {
  const router = useRouter();
  const initial = course ? draftFromCourse(course) : emptyCourseDraft();
  const [draft, dispatch] = useReducer(courseReducer, initial);
  const [saved, setSaved] = useState<CourseDraft>(initial);
  const [published, setPublished] = useState(course?.published ?? false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);

  const dirty = isCourseDirty(draft, saved);
  const departments = draft.academicLevel
    ? DEPARTMENTS[draft.academicLevel]
    : [];
  const enrolled = course?.enrolmentCount ?? 0;

  // Leaving with unsaved edits should not silently throw them away.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = (publish: boolean) => {
    if (
      !publish &&
      published &&
      enrolled > 0 &&
      !window.confirm(
        `${enrolled} ${enrolled === 1 ? "learner is" : "learners are"} enrolled. Moving this course to drafts hides it from them until it is published again. Continue?`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await saveCourseAction(
        course?.id ?? null,
        toSaveInput(draft, publish),
      );

      if (!result.success || !result.data) {
        setErrors(result.errors ?? {});
        toast.error(result.error ?? "The course could not be saved.");
        summaryRef.current?.focus();
        return;
      }

      // The saved course carries ids for every new module and lesson. Without
      // them the next save would create everything a second time.
      const fresh = draftFromCourse(result.data);
      dispatch({ type: "reset", draft: fresh });
      setSaved(fresh);
      setErrors({});
      setPublished(result.data.published);
      toast.success(result.data.published ? "Course published" : "Draft saved");

      if (!course) router.replace(`/admin/courses/${result.data.id}`);
    });
  };

  const discard = () => {
    if (window.confirm("Discard every change since the last save?")) {
      dispatch({ type: "reset", draft: saved });
      setErrors({});
    }
  };

  const errorCount = Object.values(errors).flat().length;

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[24px] font-bold text-indigo-950 md:text-[28px]">
            {course ? "Edit course" : "New course"}
          </h1>
          <p className="font-sans text-[16px] text-indigo-400">
            Build the modules and lessons learners work through
          </p>
          <p className="font-sans text-[13px] text-indigo-800">
            {published
              ? "Published — visible to learners"
              : "Draft — not visible to learners"}
            {enrolled > 0 && ` · ${enrolled} enrolled`}
            {dirty && " · Unsaved changes"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => save(false)}
            className={SECONDARY_BUTTON}
          >
            {published ? "Move to drafts" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => save(true)}
            className={PRIMARY_BUTTON}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {published ? "Save changes" : "Publish course"}
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

      <section className="flex flex-col gap-6 rounded-lg bg-indigo-100 p-4 md:p-6">
        <h2 className="font-heading text-[18px] font-bold text-indigo-950">
          Course information
        </h2>

        <Field id="course-title" label="Course title *" errors={errors.title}>
          <input
            id="course-title"
            value={draft.title}
            placeholder="e.g. Foundations of Physics"
            aria-invalid={errors.title ? true : undefined}
            onChange={(event) =>
              dispatch({ type: "setTitle", value: event.target.value })
            }
            className={cn(
              FILTER_CONTROL_CLASSNAME,
              "w-full font-normal",
              errors.title && "border-red-600",
            )}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="course-track"
            label="Learning track *"
            errors={errors.academicLevel}
          >
            <select
              id="course-track"
              value={draft.academicLevel}
              aria-invalid={errors.academicLevel ? true : undefined}
              onChange={(event) =>
                dispatch({
                  type: "setTrack",
                  value: event.target.value as AcademicLevel | "",
                })
              }
              className={cn(
                FILTER_CONTROL_CLASSNAME,
                "w-full pr-8",
                errors.academicLevel && "border-red-600",
              )}
            >
              <option value="">Choose…</option>
              {ACADEMIC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {TRACK_LABELS[level]}
                </option>
              ))}
            </select>
          </Field>

          {/* Learners only see courses in their own track and department, so
              this decides who the course is for. */}
          <Field
            id="course-department"
            label="Department *"
            errors={errors.department}
          >
            <select
              id="course-department"
              value={draft.department}
              disabled={!draft.academicLevel}
              aria-invalid={errors.department ? true : undefined}
              onChange={(event) =>
                dispatch({ type: "setDepartment", value: event.target.value })
              }
              className={cn(
                FILTER_CONTROL_CLASSNAME,
                "w-full pr-8 disabled:opacity-60",
                errors.department && "border-red-600",
              )}
            >
              <option value="">
                {draft.academicLevel ? "Choose…" : "Choose a track first"}
              </option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="course-description"
          label="Description"
          errors={errors.description}
        >
          <textarea
            id="course-description"
            rows={4}
            value={draft.description}
            aria-invalid={errors.description ? true : undefined}
            onChange={(event) =>
              dispatch({ type: "setDescription", value: event.target.value })
            }
            className={cn(
              "w-full rounded border border-indigo-800 bg-transparent px-3 py-2 font-sans text-[16px] text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              errors.description && "border-red-600",
            )}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-6 rounded-lg bg-indigo-100 p-4 md:p-6">
        <h2 className="font-heading text-[18px] font-bold text-indigo-950">
          Modules
        </h2>
        <FieldError id="course-modules-error" messages={errors.modules} />

        <ol className="flex flex-col gap-6">
          {draft.modules.map((module, moduleIndex) => {
            const locked = moduleHasProgress(module);
            const titleId = `${module.key}-title`;
            return (
              <li
                key={module.key}
                className="flex flex-col gap-4 rounded-xl border border-indigo-300 bg-indigo-100 p-4 md:p-5"
              >
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label htmlFor={titleId} className={LABEL}>
                      Module {moduleIndex + 1}
                    </label>
                    <input
                      id={titleId}
                      value={module.title}
                      placeholder="e.g. Kinematics"
                      aria-invalid={
                        errors[`modules.${moduleIndex}.title`]
                          ? true
                          : undefined
                      }
                      onChange={(event) =>
                        dispatch({
                          type: "setModuleTitle",
                          module: moduleIndex,
                          value: event.target.value,
                        })
                      }
                      className={cn(
                        FILTER_CONTROL_CLASSNAME,
                        "w-full font-normal",
                        errors[`modules.${moduleIndex}.title`] &&
                          "border-red-600",
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Move module ${moduleIndex + 1} up`}
                      disabled={moduleIndex === 0}
                      onClick={() =>
                        dispatch({
                          type: "moveModule",
                          module: moduleIndex,
                          by: -1,
                        })
                      }
                      className={ICON_BUTTON}
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move module ${moduleIndex + 1} down`}
                      disabled={moduleIndex === draft.modules.length - 1}
                      onClick={() =>
                        dispatch({
                          type: "moveModule",
                          module: moduleIndex,
                          by: 1,
                        })
                      }
                      className={ICON_BUTTON}
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete module ${moduleIndex + 1}`}
                      title={
                        locked
                          ? "Learners have completed lessons in this module"
                          : undefined
                      }
                      disabled={locked}
                      onClick={() =>
                        dispatch({ type: "removeModule", module: moduleIndex })
                      }
                      className={ICON_BUTTON}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <FieldError
                  id={`${titleId}-error`}
                  messages={errors[`modules.${moduleIndex}.title`]}
                />
                <FieldError
                  id={`${module.key}-lessons-error`}
                  messages={errors[`modules.${moduleIndex}.lessons`]}
                />

                <ol className="flex flex-col gap-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <LessonEditor
                      key={lesson.key}
                      lesson={lesson}
                      moduleIndex={moduleIndex}
                      lessonIndex={lessonIndex}
                      lessonCount={module.lessons.length}
                      errors={errors}
                      dispatch={dispatch}
                    />
                  ))}
                </ol>

                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "addLesson", module: moduleIndex })
                  }
                  className="flex items-center gap-2 self-start font-sans text-[14px] text-indigo-800 hover:underline"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add lesson
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={isPending}
          onClick={() => save(true)}
          className={PRIMARY_BUTTON}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {published ? "Save changes" : "Publish course"}
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: "addModule" })}
            className={SECONDARY_BUTTON}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add module
          </button>
          <button
            type="button"
            disabled={!dirty || isPending}
            onClick={discard}
            className={SECONDARY_BUTTON}
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
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      <FieldError id={`${id}-error`} messages={errors} />
    </div>
  );
}
