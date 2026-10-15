import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizBuilder } from "@/features/admin/quiz-builder";
import { getQuizForEditing } from "@/features/admin/quizzes";
import { getCourseOptions } from "@/features/admin/students";

export const metadata: Metadata = {
  title: "Edit quiz",
  description: "Create engaging quizzes for learners",
};

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const [lookup, courses] = await Promise.all([
    getQuizForEditing(quizId),
    getCourseOptions(),
  ]);

  if (lookup.status === "not-found") notFound();

  if (lookup.status === "error") {
    return (
      <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
        We could not load this quiz just now. Refresh the page to try again.
      </p>
    );
  }

  // Keyed by id so moving from one quiz to another starts from fresh state
  // rather than carrying the previous quiz's unsaved edits across.
  return (
    <QuizBuilder key={lookup.quiz.id} quiz={lookup.quiz} courses={courses} />
  );
}
