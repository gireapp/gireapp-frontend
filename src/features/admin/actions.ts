// ─────────────────────────────────────────────────
// GIREAPP — Admin Server Actions
// Server actions for course creation and management
// ─────────────────────────────────────────────────

'use server';

import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import type { ApiResponse, AcademicLevel } from '@gireapp/shared';
import { API_PATHS } from '@gireapp/shared';
import { serverApiClient, ApiError } from '@/lib/api-client';
import { sanitizeString } from '@/lib/sanitize';
import { logActionError } from '@/lib/log';

export async function createCourseAction(
  _prevState: ApiResponse,
  formData: FormData
): Promise<ApiResponse> {
  try {
    const session = await getSession();
    
    // Security Check: Role validation
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TUTOR')) {
      return { success: false, error: 'Unauthorized access.' };
    }

    const title = sanitizeString((formData.get('title') as string | null) ?? '');
    const description = sanitizeString((formData.get('description') as string | null) ?? '');
    const academicLevel = formData.get('academicLevel') as AcademicLevel;
    const department = sanitizeString((formData.get('department') as string | null) ?? '');
    const thumbnailUrl = formData.get('thumbnailUrl') as string | null;

    if (!title || !description || !academicLevel || !department) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    const payload = {
      title,
      description,
      academicLevel,
      department,
      thumbnailUrl,
      published: false,
    };

    const { data } = await serverApiClient<{ courseId: string }>(API_PATHS.ADMIN.COURSES, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    revalidatePath('/dashboard/courses');
    revalidatePath('/admin/courses');

    return { success: true, data: { courseId: data.courseId } };
  } catch (error) {
    logActionError('Course creation failed', error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create course.' };
  }
}
