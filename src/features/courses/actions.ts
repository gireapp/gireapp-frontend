// ─────────────────────────────────────────────────
// GIREAPP — Course Actions
// Server actions for enrolment
// ─────────────────────────────────────────────────

'use server';

import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import type { ApiResponse } from '@gireapp/shared';
import { API_PATHS } from '@gireapp/shared';
import { serverApiClient, ApiError } from '@/lib/api-client';

export async function enrollInCourseAction(courseId: string): Promise<ApiResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'You must be logged in to enroll.' };
    }

    await serverApiClient(API_PATHS.COURSES.ENROL(courseId), {
      method: 'POST'
    });

    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('[GIREAPP] Enrolment error:', error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to enroll in course. Please try again later.' };
  }
}

export async function completeLessonAction(courseId: string, lessonId: string): Promise<ApiResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'You must be logged in.' };
    }

    await serverApiClient(API_PATHS.COURSES.COMPLETE_LESSON(courseId, lessonId), {
      method: 'POST'
    });

    revalidatePath(`/dashboard/courses/${courseId}`);
    revalidatePath(`/dashboard/courses/${courseId}/lessons/${lessonId}`);

    return { success: true };
  } catch (error) {
    console.error('[GIREAPP] Complete lesson error:', error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to mark lesson as complete.' };
  }
}
