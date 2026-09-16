/**
 * Roles allowed into the /admin shell. Shared by middleware and the admin
 * layout so the two gates can never disagree about who counts as staff.
 */
export const STAFF_ROLES: readonly string[] = ["ADMIN", "TUTOR"];

export const ADMIN_HOME = "/admin";

export function isStaffRole(role: string | null | undefined): boolean {
  return role !== null && role !== undefined && STAFF_ROLES.includes(role);
}
