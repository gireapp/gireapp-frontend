"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { ACADEMIC_LEVELS, STUDENT_STATUSES } from "@gireapp/shared";
import { cn } from "@/lib/utils";
import type { CourseOption } from "@/features/admin/students";

const CONTROL_CLASSNAME =
  "h-12 rounded border border-indigo-800 bg-transparent px-3 font-sans text-[16px] font-medium text-indigo-950 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

const TRACK_LABELS: Record<string, string> = {
  SECONDARY: "Secondary",
  TERTIARY: "Tertiary",
  PROFESSIONAL: "Professional",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  INACTIVE: "Inactive",
};

export function StudentFilters({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /** Any filter change returns to page 1 — page 4 of the old result set is
   *  meaningless against the new one, and often empty. */
  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");

    startTransition(() => {
      router.replace(`/admin/students?${params.toString()}`);
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between",
        isPending && "opacity-70",
      )}
    >
      <form
        role="search"
        className="relative md:w-[266px]"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("search");
          applyFilter("search", typeof value === "string" ? value.trim() : "");
        }}
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500"
          aria-hidden="true"
        />
        <input
          type="search"
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search students"
          aria-label="Search students by name or email"
          className={cn(
            CONTROL_CLASSNAME,
            "w-full pl-11 placeholder:text-indigo-500",
          )}
        />
      </form>

      <div className="flex flex-wrap gap-3">
        {courses.length > 0 && (
          <FilterSelect
            label="Course"
            allLabel="All courses"
            value={searchParams.get("courseId") ?? ""}
            options={courses.map((course) => ({
              value: course.id,
              label: course.title,
            }))}
            onChange={(value) => applyFilter("courseId", value)}
          />
        )}

        <FilterSelect
          label="Track"
          allLabel="All tracks"
          value={searchParams.get("academicLevel") ?? ""}
          options={ACADEMIC_LEVELS.map((level) => ({
            value: level,
            label: TRACK_LABELS[level] ?? level,
          }))}
          onChange={(value) => applyFilter("academicLevel", value)}
        />

        <FilterSelect
          label="Status"
          allLabel="All status"
          value={searchParams.get("status") ?? ""}
          options={STUDENT_STATUSES.map((status) => ({
            value: status,
            label: STATUS_LABELS[status] ?? status,
          }))}
          onChange={(value) => applyFilter("status", value)}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  label: string;
  allLabel: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(CONTROL_CLASSNAME, "min-w-[149px] pr-8")}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
