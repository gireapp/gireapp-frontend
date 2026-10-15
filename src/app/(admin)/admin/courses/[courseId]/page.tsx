import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseBuilder } from "@/features/admin/course-builder";
import { getCourseForEditing } from "@/features/admin/courses";

export const metadata: Metadata = { title: "Edit course" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const lookup = await getCourseForEditing(courseId);

  if (lookup.status === "not-found") notFound();

  if (lookup.status === "error") {
    return (
      <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
        We could not load this course just now. Refresh the page to try again.
      </p>
    );
  }

  // Keyed by id so moving between courses starts from fresh state rather than
  // carrying one course's unsaved edits into another.
  return <CourseBuilder key={lookup.course.id} course={lookup.course} />;
}
