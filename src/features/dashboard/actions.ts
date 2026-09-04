"use server";

import { cache } from "react";
import { API_PATHS } from "@gireapp/shared";
import type { DashboardOverview } from "@gireapp/shared";
import { serverApiClient } from "@/lib/api-client";

/**
 * The dashboard renders its empty state when the overview can't be loaded, so a
 * backend hiccup degrades to "nothing yet" rather than an error page.
 *
 * Wrapped in React's `cache()` because both the dashboard layout (for the
 * sidebar's promo card) and the dashboard home page call this during the same
 * request — without memoisation that's two backend round trips for one page
 * load, with a small chance they disagree if one fails and the other doesn't.
 * `cache()` collapses repeat calls within a single render into one.
 */
export const getDashboardOverview = cache(
  async (): Promise<DashboardOverview | null> => {
    try {
      const { data } = await serverApiClient<DashboardOverview>(
        API_PATHS.DASHBOARD.OVERVIEW,
      );
      return data;
    } catch (error) {
      console.error("[getDashboardOverview] failed:", error);
      return null;
    }
  },
);
