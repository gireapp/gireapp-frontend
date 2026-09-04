"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, GraduationCap } from "lucide-react";
import { GireappLogo } from "@/components/shared/gireapp-logo";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/features/auth/actions";
import {
  getNavGroups,
  homeHref,
  isNavItemActive,
  type NavItem,
} from "@/features/dashboard/nav-items";

/** Rows hug their label in the design, so the active pill wraps the text rather
 *  than spanning the rail. `whitespace-nowrap` keeps "Contact Support" on one line.
 *  Height and type step down on short viewports so the full rail stays visible. */
const ROW_CLASSNAME =
  "flex h-10 w-fit items-center gap-3 whitespace-nowrap rounded-lg px-3 font-sans text-[15px] transition-colors tall:h-12 tall:text-[16px]";

const ROW_ICON_CLASSNAME = "h-5 w-5 shrink-0 tall:h-6 tall:w-6";

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        ROW_CLASSNAME,
        active
          ? "bg-indigo-400 text-indigo-50"
          : "text-indigo-400 hover:bg-indigo-400/20 hover:text-indigo-50",
      )}
    >
      <Icon className={ROW_ICON_CLASSNAME} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

function GroupDivider() {
  return (
    <hr className="border-0 border-t border-indigo-50" aria-hidden="true" />
  );
}

export type SidebarUser = { academicLevel: string | null };

export function DashboardSidebar({
  user,
  hasStarted,
}: {
  user: SidebarUser;
  hasStarted: boolean;
}) {
  const pathname = usePathname();
  const groups = getNavGroups(user.academicLevel);
  const home = homeHref(user.academicLevel);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-indigo-800 pl-8 pr-2 pt-6 md:flex tall:pt-[75px]"
      aria-label="Dashboard navigation"
    >
      <GireappLogo surface="onDark" height={32} href={home} priority />

      {/* The rail is taller than a 14" laptop viewport even after the spacing
          steps down, so everything below the logo scrolls. Without `min-h-0` a
          flex child refuses to shrink below its content and the overflow —
          Help, Support, Logout — is simply unreachable. */}
      <div className="scrollbar-slim flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-4 taller:pb-10">
        {/* `shrink-0`: as a flex child the nav would otherwise squash its rows
            down to min-content rather than let the container scroll. */}
        <nav className="mt-6 flex shrink-0 flex-col gap-3 tall:mt-14 tall:gap-10">
          {groups.map((group, index) => (
            <div key={index} className="flex flex-col gap-2 tall:gap-6">
              {index > 0 && <GroupDivider />}
              {group.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  active={isNavItemActive(
                    pathname,
                    item.href,
                    item.href === home,
                  )}
                />
              ))}
            </div>
          ))}

          <div className="flex flex-col gap-2 tall:gap-6">
            <GroupDivider />
            <form action={logoutAction}>
              <button
                type="submit"
                className={cn(
                  ROW_CLASSNAME,
                  "w-full text-indigo-400 hover:bg-indigo-400/20 hover:text-indigo-50",
                )}
              >
                <LogOut
                  className={cn(ROW_ICON_CLASSNAME, "text-red-500")}
                  aria-hidden="true"
                />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </nav>

        <JourneyCard hasStarted={hasStarted} />
      </div>
    </aside>
  );
}

/**
 * Figma: "Frame 250" — promo card pinned near the bottom of the rail. It is
 * decoration, so short viewports drop it entirely rather than spend their
 * scroll budget on it; the wrapper carries `mt-auto` so the card still sinks to
 * the bottom when the rail has room to spare.
 *
 * Copy switches once the learner has any activity, matching the dashboard
 * home's own "Welcome" → "Keep going" switch (see `hasDashboardActivity`).
 */
function JourneyCard({ hasStarted }: { hasStarted: boolean }) {
  return (
    <div className="mt-auto hidden shrink-0 pt-6 tall:block">
      <div className="flex flex-col items-center gap-2.5 rounded-[10px] bg-indigo-200/20 p-3 text-center">
        <GraduationCap
          className="h-10 w-10 text-indigo-200 taller:h-[67px] taller:w-[67px]"
          aria-hidden="true"
        />
        <p className="font-heading text-[13px] font-bold text-indigo-200">
          {hasStarted ? "Keep it up!" : "Start your journey today"}
        </p>
        <p className="font-sans text-[10px] leading-tight text-indigo-200">
          {hasStarted
            ? "Consistency today, Mastery tomorrow."
            : "Small steps today, Big achievements tomorrow"}
        </p>
      </div>
    </div>
  );
}
