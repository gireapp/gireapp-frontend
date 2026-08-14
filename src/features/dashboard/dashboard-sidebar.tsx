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
 *  than spanning the rail. `whitespace-nowrap` keeps "Contact Support" on one line. */
const ROW_CLASSNAME =
  "flex h-12 w-fit items-center gap-3 whitespace-nowrap rounded-lg px-3 font-sans text-[16px] transition-colors";

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
      <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
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

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const groups = getNavGroups(user.academicLevel);
  const home = homeHref(user.academicLevel);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-indigo-800 pl-8 pr-2 pt-[75px] md:flex"
      aria-label="Dashboard navigation"
    >
      <GireappLogo surface="onDark" height={32} href={home} priority />

      <nav className="mt-14 flex flex-col gap-10">
        {groups.map((group, index) => (
          <div key={index} className="flex flex-col gap-6">
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

        <div className="flex flex-col gap-6">
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
                className="h-6 w-6 shrink-0 text-red-500"
                aria-hidden="true"
              />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </nav>

      <JourneyCard />
    </aside>
  );
}

/** Figma: "Frame 250" — promo card pinned near the bottom of the rail. */
function JourneyCard() {
  return (
    <div className="mb-10 mt-auto flex flex-col items-center gap-2.5 rounded-[10px] bg-indigo-200/20 p-3 text-center">
      <GraduationCap
        className="h-[67px] w-[67px] text-indigo-200"
        aria-hidden="true"
      />
      <p className="font-heading text-[13px] font-bold text-indigo-200">
        Start your journey today
      </p>
      <p className="font-sans text-[10px] leading-tight text-indigo-200">
        Small steps today, Big achievements tomorrow
      </p>
    </div>
  );
}
