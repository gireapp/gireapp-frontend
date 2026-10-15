import { cache } from "react";
import type { SessionUser } from "@gireapp/shared";
import { API_PATHS } from "@gireapp/shared";
import { serverApiClient } from "@/lib/api-client";
import { getSession } from "@/lib/session";
import { logActionError } from "@/lib/log";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Super Admin",
  TUTOR: "Tutor",
};

export type StaffIdentity = {
  /** Null when the profile call fails — the rail then shows the role alone. */
  name: string | null;
  roleLabel: string;
  image: string | null;
};

/**
 * The JWT carries the role but not the name or avatar, so the rail's account
 * card needs the profile. Cached per request: the layout renders it on every
 * admin page. A failure degrades to the role label rather than erroring, the
 * same way `getDashboardOverview` degrades to the empty state.
 */
export const getStaffIdentity = cache(async (): Promise<StaffIdentity> => {
  const session = await getSession();
  const roleLabel = (session && ROLE_LABELS[session.role]) ?? "Staff";

  try {
    const { data } = await serverApiClient<SessionUser>(API_PATHS.AUTH.ME);
    return { name: data.name, roleLabel, image: data.image };
  } catch (error) {
    logActionError("Staff identity lookup failed", error);
    return { name: null, roleLabel, image: null };
  }
});
