import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getQuizIntro } from "@/features/quizzes/quizzes";
import { QuizRunner } from "@/features/quizzes/quiz-runner";

export const metadata: Metadata = { title: "Quiz | GIREAPP" };

/*
 * No Figma frame exists for taking a quiz. Built from the existing design
 * system — the dashboard's "Start quiz" card already links here — for the
 * designer to refine.
 */
export default async function QuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const lookup = await getQuizIntro(quizId);

  if (lookup.status === "not-found") notFound();

  if (lookup.status === "error") {
    return (
      <p className="rounded-xl bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
        We could not load this quiz just now. Refresh the page to try again.
      </p>
    );
  }

  const { intro } = lookup;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
      <Link
        href={`/dashboard/courses/${intro.course.id}`}
        className="inline-flex items-center gap-2 self-start font-sans text-[14px] text-indigo-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {intro.course.title}
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[24px] font-bold text-indigo-950 md:text-[28px]">
          {intro.title}
        </h1>
      </header>

      <QuizRunner intro={intro} />
    </div>
  );
}
