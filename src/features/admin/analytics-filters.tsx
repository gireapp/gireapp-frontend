"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  ACADEMIC_LEVELS,
  ANALYTICS_GROUPINGS,
  ANALYTICS_RANGE_DAYS,
  type AnalyticsGrouping,
  type AnalyticsQuery,
} from "@gireapp/shared";
import { cn } from "@/lib/utils";
import { FilterSelect } from "@/features/admin/filter-select";
import { TRACK_LABELS } from "@/features/admin/track-labels";
import type { CourseOption } from "@/features/admin/students";

const GROUPING_LABELS: Record<AnalyticsGrouping, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
};

/** Every parameter this bar owns, so "Clear filters" knows what to drop. */
const FILTER_KEYS = ["rangeDays", "academicLevel", "courseId", "groupBy"];

/**
 * `selected` is the query the page actually ran, not the raw URL: a hand-typed
 * `rangeDays=999` falls back to the default server-side, and a control showing
 * something the page did not use is worse than no control at all.
 */
export function AnalyticsFilters({
  courses,
  selected,
}: {
  courses: CourseOption[];
  selected: AnalyticsQuery;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigate = (params: URLSearchParams) => {
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/admin/analytics?${query}` : "/admin/analytics");
    });
  };

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    navigate(params);
  };

  const hasFilters = FILTER_KEYS.some((key) => searchParams.has(key));

  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end",
        isPending && "opacity-70",
      )}
    >
      <Field label="Date range">
        <FilterSelect
          label="Date range"
          value={String(selected.rangeDays)}
          options={ANALYTICS_RANGE_DAYS.map((days) => ({
            value: String(days),
            label: `Last ${days} days`,
          }))}
          onChange={(value) => applyFilter("rangeDays", value)}
        />
      </Field>

      <Field label="Track">
        <FilterSelect
          label="Track"
          allLabel="All tracks"
          value={selected.academicLevel ?? ""}
          options={ACADEMIC_LEVELS.map((level) => ({
            value: level,
            label: TRACK_LABELS[level] ?? level,
          }))}
          onChange={(value) => applyFilter("academicLevel", value)}
        />
      </Field>

      {courses.length > 0 && (
        <Field label="Course">
          <FilterSelect
            label="Course"
            allLabel="All courses"
            value={selected.courseId ?? ""}
            options={courses.map((course) => ({
              value: course.id,
              label: course.title,
            }))}
            onChange={(value) => applyFilter("courseId", value)}
          />
        </Field>
      )}

      <Field label="Group by">
        <FilterSelect
          label="Group by"
          value={selected.groupBy}
          options={ANALYTICS_GROUPINGS.map((grouping) => ({
            value: grouping,
            label: GROUPING_LABELS[grouping],
          }))}
          onChange={(value) => applyFilter("groupBy", value)}
        />
      </Field>

      {hasFilters && (
        <button
          type="button"
          onClick={() => navigate(new URLSearchParams())}
          className="h-12 self-start font-sans text-[14px] text-coral-500 underline underline-offset-4 md:self-end"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {/* The select carries the same text as its aria-label, so this heading is
          decorative to a screen reader and would otherwise be read twice. */}
      <span
        aria-hidden="true"
        className="font-sans text-[14px] text-indigo-950"
      >
        {label}
      </span>
      {children}
    </div>
  );
}
