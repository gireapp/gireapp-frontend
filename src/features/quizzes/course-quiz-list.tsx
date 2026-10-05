import Link from "next/link";
import { CheckCircle2, ClipboardList } from "lucide-react";
import type { CourseQuizSummary } from "@gireapp/shared";

/** The quizzes section of a course page. */
export function CourseQuizList({
  quizzes,
  isEnrolled,
}: {
  quizzes: CourseQuizSummary[];
  isEnrolled: boolean;
}) {
  if (quizzes.length === 0) return null;

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-h3 text-foreground">Quizzes</h2>
      {!isEnrolled && (
        <p className="text-sm text-muted-foreground">
          Enrol in this course to take its quizzes and earn points.
        </p>
      )}
      <ul className="space-y-3">
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <Link
              href={`/dashboard/quizzes/${quiz.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                {quiz.history.passed ? (
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-success"
                    aria-label="Passed"
                  />
                ) : (
                  <ClipboardList
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {quiz.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {quiz.questionCount}{" "}
                    {quiz.questionCount === 1 ? "question" : "questions"} ·{" "}
                    {quiz.timeLimitMin} min
                    {quiz.history.bestScore !== null &&
                      ` · Best ${quiz.history.bestScore}%`}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium text-primary">
                {quiz.history.attemptCount > 0 ? "Retake" : "Start"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
