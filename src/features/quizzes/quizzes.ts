import { z } from "zod";
import type { LearnerQuizIntro } from "@gireapp/shared";
import { API_PATHS } from "@gireapp/shared";
import { ApiError, serverApiClient } from "@/lib/api-client";
import { logActionError } from "@/lib/log";

const HTTP_NOT_FOUND = 404;

/*
 * The id is spliced into the backend URL. The API client only checks the
 * origin, so an unchecked id like "../../admin/students" would reach another
 * endpoint. Anything that is not a cuid cannot be a quiz anyway.
 */
export const quizIdSchema = z.string().cuid();

export type QuizIntroLookup =
  | { status: "found"; intro: LearnerQuizIntro }
  | { status: "not-found" }
  | { status: "error" };

/** Separates "no such quiz" (a 404 page) from "backend down" (a retry message). */
export async function getQuizIntro(quizId: string): Promise<QuizIntroLookup> {
  if (!quizIdSchema.safeParse(quizId).success) return { status: "not-found" };

  try {
    const { data } = await serverApiClient<LearnerQuizIntro>(
      API_PATHS.QUIZZES.DETAIL(quizId),
    );
    return { status: "found", intro: data };
  } catch (error) {
    if (error instanceof ApiError && error.status === HTTP_NOT_FOUND) {
      return { status: "not-found" };
    }
    logActionError("Quiz intro lookup failed", error);
    return { status: "error" };
  }
}
