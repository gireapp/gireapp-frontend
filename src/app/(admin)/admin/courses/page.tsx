import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminCourses } from "@/features/admin/courses";
import { CourseList } from "@/features/admin/course-list";

export const metadata: Metadata = {
  title: "Courses",
  description: "Build and publish courses for learners",
};

/*
 * No Figma frame exists for course management. Kept in the visual language of
 * the quiz list and student listing for the designer to style.
 */
export default async function CoursesPage() {
  const courses = await getAdminCourses();

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[24px] font-bold text-indigo-950 md:text-[28px]">
            Courses
          </h1>
          <p className="font-sans text-[16px] text-indigo-400">
            Build and publish courses for learners
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex h-10 items-center gap-2 self-start rounded bg-coral-500 px-4 font-sans text-[14px] font-medium text-indigo-50 transition-colors hover:bg-coral-600"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New course
        </Link>
      </header>

      {courses === null ? (
        <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
          We could not load courses just now. Refresh the page to try again.
        </p>
      ) : (
        <CourseList courses={courses} />
      )}
    </div>
  );
}
