"use server";

import { revalidatePath } from "next/cache";
import {
  API_PATHS,
  submitQuizSchema,
  type ApiResponse,
  type QuizResult,
  type StartedQuiz,
} from "@gireapp/shared";
import { ApiError, serverApiClient } from "@/lib/api-client";
import { getSession } from "@/lib/session";
import { logActionError } from "@/lib/log";
import { quizIdSchema } from "@/features/quizzes/quizzes";

const HTTP_GONE = 410;

/** `timeExpired` lets the screen say "time ran out" instead of a generic error. */
export type SubmitQuizResponse = ApiResponse<QuizResult> & {
  timeExpired?: boolean;
};

const NOT_SIGNED_IN = "Your session has ended. Sign in again to continue.";
const NO_SUCH_QUIZ = "That quiz could not be found.";

export async function startQuizAction(
  quizId: string,
): Promise<ApiResponse<StartedQuiz>> {
  if (!(await getSession())) return { success: false, error: NOT_SIGNED_IN };
  if (!quizIdSchema.safeParse(quizId).success) {
    return { success: false, error: NO_SUCH_QUIZ };
  }

  try {
    const { data } = await serverApiClient<StartedQuiz>(
      API_PATHS.QUIZZES.START(quizId),
      { method: "POST" },
    );
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError)
      return { success: false, error: error.message };
    logActionError("Quiz start failed", error);
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function submitQuizAction(
  quizId: string,
  ticket: string,
  answers: Record<string, string>,
): Promise<SubmitQuizResponse> {
  if (!(await getSession())) return { success: false, error: NOT_SIGNED_IN };
  if (!quizIdSchema.safeParse(quizId).success) {
    return { success: false, error: NO_SUCH_QUIZ };
  }

  const parsed = submitQuizSchema.safeParse({ ticket, answers });
  if (!parsed.success) {
    return {
      success: false,
      error: "These answers could not be read. Try again.",
    };
  }

  let result: QuizResult;
  try {
    const { data } = await serverApiClient<QuizResult>(
      API_PATHS.QUIZZES.SUBMIT(quizId),
      { method: "POST", body: JSON.stringify(parsed.data) },
    );
    result = data;
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        timeExpired: error.status === HTTP_GONE,
      };
    }
    logActionError("Quiz submit failed", error);
    return {
      success: false,
      error: "Network error. Your answers are still here — try again.",
    };
  }

  // Outside the try: a revalidation fault must not report a recorded attempt
  // as a failed submission.
  revalidatePath("/dashboard", "layout");
  return { success: true, data: result };
}
