"use client";

import { Search, Bell, ChevronDown, Trophy } from "lucide-react";
import { GireappLogo } from "@/components/shared/gireapp-logo";
import { getInitials, formatNumber } from "@/lib/utils";

/** "SECONDARY" -> "Secondary", to match Figma's "Secondary.Science" label. */
function formatAcademicLevel(level: string): string {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

export function DashboardTopbar({
  name,
  department,
  academicLevel,
  points = 0,
  notificationCount = 0,
}: {
  name: string;
  department: string | null;
  academicLevel: string | null;
  /** FE-DASH-007: total points belong in the header, beside the identity. */
  points?: number;
  notificationCount?: number;
}) {
  const roleLabel = academicLevel
    ? `${formatAcademicLevel(academicLevel)}.${department ?? "Student"}`
    : (department ?? "Student");

  return (
    <div className="flex items-center justify-between gap-4 md:gap-8">
      {/* The rail carries the wordmark on desktop, so it only appears here once
          the rail is gone; search is desktop-only in the mobile design. */}
      <div className="md:hidden">
        <GireappLogo surface="onLight" height={28} />
      </div>

      <label className="hidden h-9 w-full max-w-[472px] items-center gap-3 rounded-xl bg-indigo-100 px-2 md:flex">
        <Search
          className="h-5 w-5 shrink-0 text-indigo-400"
          aria-hidden="true"
        />
        <span className="sr-only">Search</span>
        <input
          type="search"
          placeholder="Search"
          className="w-full bg-transparent font-sans text-[14px] text-indigo-950 placeholder:text-indigo-400 focus:outline-none"
        />
      </label>

      <div className="flex shrink-0 items-center gap-3 md:gap-4">
        <span
          className="flex h-8 items-center gap-1.5 rounded-full bg-indigo-100 px-3"
          title={`${formatNumber(points)} learning points`}
        >
          <Trophy className="h-4 w-4 text-indigo-800" aria-hidden="true" />
          <span className="font-heading text-[13px] font-bold text-indigo-800">
            {formatNumber(points)}
          </span>
          <span className="sr-only">learning points</span>
        </span>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-indigo-800 transition-colors hover:bg-indigo-100"
          aria-label={
            notificationCount > 0
              ? `Notifications, ${notificationCount} unread`
              : "Notifications"
          }
        >
          <Bell className="h-6 w-6" aria-hidden="true" />
          {notificationCount > 0 && (
            <span
              className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 font-sans text-[12px] text-indigo-50"
              aria-hidden="true"
            >
              {notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-950 font-sans text-[20px] text-indigo-400">
            {getInitials(name)}
          </span>
          <span className="hidden flex-col md:flex">
            <span className="font-sans text-[16px] text-indigo-950">
              {name}
            </span>
            <span className="font-sans text-[12px] text-indigo-400">
              {roleLabel}
            </span>
          </span>
          <ChevronDown
            className="hidden h-4 w-4 text-indigo-400 md:block"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
