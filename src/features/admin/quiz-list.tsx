import Link from "next/link";
import type { AdminQuizSummary } from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { TRACK_LABELS } from "@/features/admin/track-labels";

const UPDATED_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

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

function questionCount(count: number): string {
  return count === 1 ? "1 question" : `${count} questions`;
}

export function QuizList({ quizzes }: { quizzes: AdminQuizSummary[] }) {
  if (quizzes.length === 0) {
    return (
      <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
        No quizzes yet. Create one to get started.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {quizzes.map((quiz) => (
        <li key={quiz.id}>
          <Link
            href={`/admin/quizzes/${quiz.id}`}
            className="flex flex-col gap-2 rounded-lg bg-indigo-100 px-4 py-4 transition-colors hover:bg-indigo-200 sm:flex-row sm:items-center sm:justify-between md:px-6"
          >
            <div className="min-w-0">
              <p className="truncate font-sans text-[16px] font-medium text-indigo-950">
                {quiz.title}
              </p>
              <p className="font-sans text-[13px] text-indigo-800">
                {TRACK_LABELS[quiz.course.academicLevel]} · {quiz.course.title}{" "}
                · {questionCount(quiz.questionCount)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span className="font-sans text-[13px] text-indigo-800">
                Updated {UPDATED_FORMAT.format(new Date(quiz.updatedAt))}
              </span>
              <StatusBadge published={quiz.published} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
