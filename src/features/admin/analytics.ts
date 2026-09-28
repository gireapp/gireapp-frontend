import type { AdminAnalytics, AnalyticsQuery } from "@gireapp/shared";
import { API_PATHS } from "@gireapp/shared";
import { serverApiClient } from "@/lib/api-client";
import { logActionError } from "@/lib/log";

/**
 * Returns null on failure so the screen degrades to a message rather than
 * erroring the whole admin shell, matching the other admin loaders.
 */
export async function getAdminAnalytics(
  query: AnalyticsQuery,
): Promise<AdminAnalytics | null> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  try {
    const { data } = await serverApiClient<AdminAnalytics>(
      `${API_PATHS.ADMIN.ANALYTICS}?${params.toString()}`,
    );
    return data;
  } catch (error) {
    logActionError("Admin analytics lookup failed", error);
    return null;
  }
}
