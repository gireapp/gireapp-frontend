"use server";

import { revalidatePath } from "next/cache";
import {
  API_PATHS,
  issuesByPath,
  saveCourseSchema,
  type AdminCourse,
  type ApiResponse,
  type LessonUploadTicket,
  type SaveCourseRequest,
} from "@gireapp/shared";
import { ApiError, serverApiClient } from "@/lib/api-client";
import { getSession } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { logActionError } from "@/lib/log";
import { courseIdSchema } from "@/features/admin/courses";

const UNAUTHORIZED = "Unauthorized access.";

async function isStaff(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session && isStaffRole(session.role));
}

/** Creates the course when `courseId` is null, otherwise replaces it. */
export async function saveCourseAction(
  courseId: string | null,
  input: SaveCourseRequest,
): Promise<ApiResponse<AdminCourse>> {
  if (!(await isStaff())) return { success: false, error: UNAUTHORIZED };
  if (courseId !== null && !courseIdSchema.safeParse(courseId).success) {
    return { success: false, error: "That course could not be found." };
  }

  const parsed = saveCourseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Fix the highlighted fields and try again.",
      errors: issuesByPath(parsed.error),
    };
  }

  let saved: AdminCourse;
  try {
    const { data } = await serverApiClient<AdminCourse>(
      courseId ? API_PATHS.ADMIN.COURSE(courseId) : API_PATHS.ADMIN.COURSES,
      { method: courseId ? "PUT" : "POST", body: JSON.stringify(parsed.data) },
    );
    saved = data;
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        errors: error.fieldErrors,
      };
    }
    logActionError("Course save failed", error);
    return { success: false, error: "Network error. Please try again." };
  }

  // Outside the try: a revalidation fault must not report a saved course as
  // a failed save. Learner pages too, since publishing changes what they list.
  revalidatePath("/admin/courses", "layout");
  revalidatePath("/dashboard", "layout");
  return { success: true, data: saved };
}

/**
 * Where the browser should PUT a lesson file. The bytes go straight to
 * storage; only the returned key is saved on the lesson.
 */
export async function requestLessonUploadAction(
  filename: string,
): Promise<ApiResponse<LessonUploadTicket>> {
  if (!(await isStaff())) return { success: false, error: UNAUTHORIZED };

  try {
    const { data } = await serverApiClient<LessonUploadTicket>(
      `${API_PATHS.ADMIN.UPLOAD_URL}?${new URLSearchParams({ filename })}`,
    );
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError)
      return { success: false, error: error.message };
    logActionError("Lesson upload URL failed", error);
    return {
      success: false,
      error: "Could not start the upload. Please try again.",
    };
  }
}
