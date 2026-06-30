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
import { sanitizeInput } from '@/lib/utils';

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

    const title = sanitizeInput(formData.get('title') as string);
    const description = sanitizeInput(formData.get('description') as string);
    const academicLevel = formData.get('academicLevel') as AcademicLevel;
    const department = sanitizeInput(formData.get('department') as string);
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
    console.error('[GIREAPP] Course creation error:', error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create course.' };
  }
}
