import Link from "next/link";
import type { AdminCourseSummary } from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { TRACK_LABELS } from "@/features/admin/track-labels";

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded px-3 font-sans text-[13px] text-indigo-50",
        published ? "bg-green-500" : "bg-indigo-400",
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

/** Courses a tutor cannot edit are listed but not linked. */
export function CourseList({ courses }: { courses: AdminCourseSummary[] }) {
  if (courses.length === 0) {
    return (
      <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
        No courses yet. Create one to get started.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {courses.map((course) => {
        const body = (
          <>
            <div className="min-w-0">
              <p className="truncate font-sans text-[16px] font-medium text-indigo-950">
                {course.title}
              </p>
              <p className="font-sans text-[13px] text-indigo-800">
                {TRACK_LABELS[course.academicLevel]} · {course.department} ·{" "}
                {plural(course.moduleCount, "module")} ·{" "}
                {plural(course.lessonCount, "lesson")} ·{" "}
                {plural(course.quizCount, "quiz", "quizzes")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span className="font-sans text-[13px] text-indigo-800">
                {plural(course.enrolmentCount, "learner")}
              </span>
              <StatusBadge published={course.published} />
            </div>
          </>
        );
        const rowClass =
          "flex flex-col gap-2 rounded-lg bg-indigo-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6";

        return (
          <li key={course.id}>
            {course.canEdit ? (
              <Link
                href={`/admin/courses/${course.id}`}
                className={cn(
                  rowClass,
                  "transition-colors hover:bg-indigo-200",
                )}
              >
                {body}
              </Link>
            ) : (
              <div
                className={cn(rowClass, "opacity-80")}
                title="Written by another tutor"
              >
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
