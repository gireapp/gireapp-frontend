import type { AdminQuiz, AdminQuizSummary } from "@gireapp/shared";
import { API_PATHS } from "@gireapp/shared";
import { ApiError, serverApiClient } from "@/lib/api-client";
import { logActionError } from "@/lib/log";

const HTTP_NOT_FOUND = 404;

/** Null on failure so the list degrades to a message, like the other loaders. */
export async function getQuizzes(): Promise<AdminQuizSummary[] | null> {
  try {
    const { data } = await serverApiClient<AdminQuizSummary[]>(
      API_PATHS.ADMIN.QUIZZES,
    );
    return data;
  } catch (error) {
    logActionError("Quiz list lookup failed", error);
    return null;
  }
}

export type QuizLookup =
  | { status: "found"; quiz: AdminQuiz }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Distinguishes "no such quiz" (a 404 page) from "the backend is down" (a
 * retryable message), which a bare null cannot.
 */
export async function getQuizForEditing(quizId: string): Promise<QuizLookup> {
  try {
    const { data } = await serverApiClient<AdminQuiz>(
      API_PATHS.ADMIN.QUIZ(quizId),
    );
    return { status: "found", quiz: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === HTTP_NOT_FOUND) {
      return { status: "not-found" };
    }
    logActionError("Quiz lookup failed", error);
    return { status: "error" };
  }
}
