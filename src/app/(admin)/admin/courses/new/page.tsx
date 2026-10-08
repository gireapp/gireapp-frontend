import type { Metadata } from "next";
import { CourseBuilder } from "@/features/admin/course-builder";

export const metadata: Metadata = { title: "New course" };

export default function NewCoursePage() {
  return <CourseBuilder course={null} />;
}
