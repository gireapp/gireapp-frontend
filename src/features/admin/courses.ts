import { z } from "zod";
import type { AdminCourse, AdminCourseSummary } from "@gireapp/shared";
import { API_PATHS } from "@gireapp/shared";
import { ApiError, serverApiClient } from "@/lib/api-client";
import { logActionError } from "@/lib/log";

const HTTP_NOT_FOUND = 404;

/*
 * The id is spliced into the backend URL, and the API client only guards the
 * origin. Generated ids are cuids; anything else cannot name a course.
 */
export const courseIdSchema = z.string().cuid();

/** Null on failure so the list degrades to a message, like the other loaders. */
export async function getAdminCourses(): Promise<AdminCourseSummary[] | null> {
  try {
    const { data } = await serverApiClient<AdminCourseSummary[]>(
      API_PATHS.ADMIN.COURSES,
    );
    return data;
  } catch (error) {
    logActionError("Course list lookup failed", error);
    return null;
  }
}

export type CourseLookup =
  | { status: "found"; course: AdminCourse }
  | { status: "not-found" }
  | { status: "error" };

export async function getCourseForEditing(
  courseId: string,
): Promise<CourseLookup> {
  if (!courseIdSchema.safeParse(courseId).success)
    return { status: "not-found" };

  try {
    const { data } = await serverApiClient<AdminCourse>(
      API_PATHS.ADMIN.COURSE(courseId),
    );
    return { status: "found", course: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === HTTP_NOT_FOUND) {
      return { status: "not-found" };
    }
    logActionError("Course lookup failed", error);
    return { status: "error" };
  }
}
