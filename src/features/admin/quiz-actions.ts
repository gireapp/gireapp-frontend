"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  API_PATHS,
  issuesByPath,
  saveQuizSchema,
  type AdminQuiz,
  type ApiResponse,
  type SaveQuizRequest,
} from "@gireapp/shared";
import { ApiError, serverApiClient } from "@/lib/api-client";
import { getSession } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { logActionError } from "@/lib/log";

/*
 * The id is spliced into the backend URL. The API client's SSRF guard only
 * checks the origin, so an unchecked id like "../students" would still reach a
 * different admin endpoint. Requiring a cuid closes that.
 */
const quizIdSchema = z.string().cuid();

/** Creates the quiz when `quizId` is null, otherwise replaces it. */
export async function saveQuizAction(
  quizId: string | null,
  input: SaveQuizRequest,
): Promise<ApiResponse<AdminQuiz>> {
  const session = await getSession();
  if (!session || !isStaffRole(session.role)) {
    return { success: false, error: "Unauthorized access." };
  }

  if (quizId !== null && !quizIdSchema.safeParse(quizId).success) {
    return { success: false, error: "That quiz could not be found." };
  }

  const parsed = saveQuizSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Fix the highlighted fields and try again.",
      errors: issuesByPath(parsed.error),
    };
  }

  let saved: AdminQuiz;
  try {
    const { data } = await serverApiClient<AdminQuiz>(
      quizId ? API_PATHS.ADMIN.QUIZ(quizId) : API_PATHS.ADMIN.QUIZZES,
      { method: quizId ? "PUT" : "POST", body: JSON.stringify(parsed.data) },
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
    logActionError("Quiz save failed", error);
    return { success: false, error: "Network error. Please try again." };
  }

  // Outside the try: a revalidation fault must not be reported as a failed
  // save when the write itself succeeded.
  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${saved.id}`);

  return { success: true, data: saved };
}
