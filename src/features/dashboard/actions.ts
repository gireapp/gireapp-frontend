"use server";

import { API_PATHS } from "@gireapp/shared";
import type { DashboardOverview } from "@gireapp/shared";
import { serverApiClient } from "@/lib/api-client";

/**
 * The dashboard renders its empty state when the overview can't be loaded, so a
 * backend hiccup degrades to "nothing yet" rather than an error page.
 */
export async function getDashboardOverview(): Promise<DashboardOverview | null> {
  try {
    const { data } = await serverApiClient<DashboardOverview>(
      API_PATHS.DASHBOARD.OVERVIEW,
    );
    return data;
  } catch (error) {
    console.error("[getDashboardOverview] failed:", error);
    return null;
  }
}
