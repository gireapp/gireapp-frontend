import type { CourseCard, DashboardOverview } from "@gireapp/shared";

export function findResumeCourse(courses: CourseCard[]): CourseCard | null {
  const started = courses.filter((c) => c.progress > 0 && c.progress < 1);
  const [first] = started.length > 0 ? started : courses;
  return first ?? null;
}

/**
 * A learner "has started" once they've earned points, earned a badge, or have
 * a course in progress. Both the dashboard home and the sidebar's promo card
 * (rendered in the layout, on every dashboard route) need this same answer,
 * so it lives in one place rather than two copies drifting apart.
 */
export function hasDashboardActivity(
  overview: DashboardOverview | null,
): boolean {
  if (!overview) return false;
  const resume = findResumeCourse(overview.activeCourses);
  return overview.totalPoints > 0 || overview.badgeCount > 0 || resume !== null;
}
