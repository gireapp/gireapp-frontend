"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function DashboardTopbar({
  name,
  department,
}: {
  name: string;
  department: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-8">
      <label className="flex h-9 w-full max-w-[472px] items-center gap-3 rounded-xl bg-indigo-100 px-2">
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

      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-indigo-800 transition-colors hover:bg-indigo-100"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-800 font-heading text-[14px] font-bold text-indigo-50">
            {getInitials(name)}
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-[14px] font-bold text-indigo-950">
              {name}
            </span>
            <span className="font-sans text-[12px] text-indigo-400">
              {department ?? "Student"}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-indigo-400" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
