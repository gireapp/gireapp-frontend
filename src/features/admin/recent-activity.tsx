import { GraduationCap, FileQuestion, type LucideIcon } from "lucide-react";
import type { AdminActivity, AdminActivityType } from "@gireapp/shared";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";

const ACTIVITY_HEADINGS: Record<AdminActivityType, string> = {
  STUDENT_REGISTERED: "New student registered",
  QUIZ_CREATED: "Quiz created",
};

const ACTIVITY_ICONS: Record<AdminActivityType, LucideIcon> = {
  STUDENT_REGISTERED: GraduationCap,
  QUIZ_CREATED: FileQuestion,
};

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * "2 mins ago". Deliberately coarse and computed on the server: a live-ticking
 * relative time would make every dashboard render a client component, and the
 * page is re-fetched often enough for minute precision to be honest.
 */
export function relativeTime(at: string, now: Date = new Date()): string {
  const elapsed = now.getTime() - new Date(at).getTime();

  if (elapsed < MINUTE_MS) return "just now";
  if (elapsed < HOUR_MS) return plural(Math.floor(elapsed / MINUTE_MS), "min");
  if (elapsed < DAY_MS) return plural(Math.floor(elapsed / HOUR_MS), "hour");
  return plural(Math.floor(elapsed / DAY_MS), "day");
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
}

/** Figma "Frame 289". */
export function RecentActivity({ activity }: { activity: AdminActivity[] }) {
  if (activity.length === 0) {
    return (
      <AdminPanelEmpty>
        Nothing has happened on the platform yet.
      </AdminPanelEmpty>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {activity.map((entry) => {
        const Icon = ACTIVITY_ICONS[entry.type];

        return (
          <li
            key={entry.id}
            className="flex items-center gap-4 rounded-lg bg-indigo-50 px-4 py-3"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100"
            >
              <Icon className="h-5 w-5 text-indigo-800" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[15px] text-indigo-950">
                {ACTIVITY_HEADINGS[entry.type]}
              </p>
              <p className="break-words font-sans text-[13px] text-indigo-800 md:truncate">
                {entry.detail}
              </p>
            </div>
            <time
              dateTime={entry.at}
              className="shrink-0 font-sans text-[13px] text-indigo-800"
            >
              {relativeTime(entry.at)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
