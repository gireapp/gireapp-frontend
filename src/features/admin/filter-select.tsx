"use client";

import { cn } from "@/lib/utils";

export const FILTER_CONTROL_CLASSNAME =
  "h-12 rounded border border-indigo-800 bg-transparent px-3 font-sans text-[16px] font-medium text-indigo-950 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

export type FilterOption = { value: string; label: string };

/**
 * A native `<select>` rather than a custom listbox: it is keyboard- and
 * screen-reader-correct for free, and opens as the platform picker on a phone.
 */
export function FilterSelect({
  label,
  allLabel,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  /** The "no filter" entry, e.g. "All courses". Omit when a value is required. */
  allLabel?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(FILTER_CONTROL_CLASSNAME, "min-w-[149px] pr-8", className)}
    >
      {allLabel !== undefined && <option value="">{allLabel}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
