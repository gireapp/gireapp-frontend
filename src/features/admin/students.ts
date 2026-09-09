import type { StudentListItem, StudentListQuery } from "@gireapp/shared";
import { API_PATHS } from "@gireapp/shared";
import { serverApiClient, type ApiMeta } from "@/lib/api-client";
import { logActionError } from "@/lib/log";

export type StudentListResult = {
  students: StudentListItem[];
  meta: ApiMeta;
};

/**
 * Returns null on failure so the listing degrades to its error state rather
 * than taking the whole admin shell down, matching `getDashboardOverview`.
 */
export async function getStudents(
  query: StudentListQuery,
): Promise<StudentListResult | null> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  try {
    const { data, meta } = await serverApiClient<StudentListItem[]>(
      `${API_PATHS.ADMIN.STUDENTS}?${params.toString()}`,
    );

    return {
      students: data,
      meta: meta ?? {
        page: query.page,
        limit: query.limit,
        total: data.length,
        totalPages: 1,
      },
    };
  } catch (error) {
    logActionError("Student listing failed", error);
    return null;
  }
}

export type CourseOption = { id: string; title: string };

/**
 * Options for the course filter. An empty list is a valid answer — the filter
 * is then omitted rather than rendered with nothing to pick.
 */
export async function getCourseOptions(): Promise<CourseOption[]> {
  try {
    const { data } = await serverApiClient<CourseOption[]>(
      API_PATHS.ADMIN.COURSES,
    );
    return data;
  } catch (error) {
    logActionError("Course options lookup failed", error);
    return [];
  }
}
