import type { AdminOverview } from "@gireapp/shared";
import { API_PATHS } from "@gireapp/shared";
import { serverApiClient } from "@/lib/api-client";
import { logActionError } from "@/lib/log";

/**
 * Returns null on failure so the dashboard degrades to a message rather than
 * erroring the whole admin shell, matching `getDashboardOverview`.
 */
export async function getAdminOverview(): Promise<AdminOverview | null> {
  try {
    const { data } = await serverApiClient<AdminOverview>(
      API_PATHS.ADMIN.OVERVIEW,
    );
    return data;
  } catch (error) {
    logActionError("Admin overview lookup failed", error);
    return null;
  }
}
