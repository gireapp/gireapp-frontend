import type { Metadata } from "next";
import { QuizBuilder } from "@/features/admin/quiz-builder";
import { getCourseOptions } from "@/features/admin/students";

export const metadata: Metadata = {
  title: "New quiz",
  description: "Create engaging quizzes for learners",
};

export default async function NewQuizPage() {
  const courses = await getCourseOptions();
  return <QuizBuilder quiz={null} courses={courses} />;
}
