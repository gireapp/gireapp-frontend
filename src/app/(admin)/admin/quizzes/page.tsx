import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getQuizzes } from "@/features/admin/quizzes";
import { QuizList } from "@/features/admin/quiz-list";

export const metadata: Metadata = {
  title: "Quiz Builder",
  description: "Create engaging quizzes for learners",
};

/*
 * No Figma frame exists for this list — the design shows only the builder.
 * Without it a saved draft would have no way back, so it is kept deliberately
 * plain, in the student listing's visual language, for the designer to style.
 */
export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[24px] font-bold text-indigo-950 md:text-[28px]">
            Quiz Builder
          </h1>
          <p className="font-sans text-[16px] text-indigo-400">
            Create engaging quizzes for learners
          </p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="flex h-10 items-center gap-2 self-start rounded bg-coral-500 px-4 font-sans text-[14px] font-medium text-indigo-50 transition-colors hover:bg-coral-600"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create quiz
        </Link>
      </header>

      {quizzes === null ? (
        <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
          We could not load quizzes just now. Refresh the page to try again.
        </p>
      ) : (
        <QuizList quizzes={quizzes} />
      )}
    </div>
  );
}
