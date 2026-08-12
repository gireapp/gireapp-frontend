"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  TrendingUp,
  Users,
  UserCircle,
  HelpCircle,
  Headphones,
  LogOut,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/features/auth/actions";

/** Figma: "Side nav bar" — 240px column, groups separated by 1px rules. */
export const SIDEBAR_WIDTH_PX = 240;

const SEGMENT_MAP: Record<string, string> = {
  SECONDARY: "/dashboard/secondary",
  TERTIARY: "/dashboard/tertiary",
  PROFESSIONAL: "/dashboard/professional",
};

type NavItem = { href: string; label: string; icon: LucideIcon };

function getNavGroups(academicLevel: string | null): NavItem[][] {
  const home = (academicLevel && SEGMENT_MAP[academicLevel]) || "/dashboard";

  return [
    [
      { href: home, label: "Home", icon: Home },
      { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
      { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
      { href: "/dashboard/mentors", label: "Mentors", icon: Users },
    ],
    [
      {
        href: "/dashboard/settings",
        label: "Profile & Settings",
        icon: UserCircle,
      },
    ],
    [
      { href: "/dashboard/help", label: "Help Center", icon: HelpCircle },
      {
        href: "/dashboard/support",
        label: "Contact Support",
        icon: Headphones,
      },
    ],
  ];
}

/** A nav row is active for its own route and anything nested beneath it, except
 *  "Home", whose href is a segment root that every other route also sits under. */
function isActive(pathname: string, href: string, isHome: boolean): boolean {
  if (isHome) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ROW_CLASSNAME =
  "flex h-12 items-center gap-3 rounded-lg px-3 font-sans text-[16px] transition-colors";

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
      <span className="truncate">{item.label}</span>
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
  const homeHref = groups[0]?.[0]?.href;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-indigo-800 pl-8 pr-9 pt-[75px] lg:flex"
      aria-label="Dashboard navigation"
    >
      <Link href={homeHref ?? "/dashboard"} className="flex items-center gap-8">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-indigo-50">
          <GraduationCap
            className="h-4 w-4 text-indigo-800"
            aria-hidden="true"
          />
        </span>
        <span className="font-heading text-[28px] font-bold text-white">
          GIREAPP
        </span>
      </Link>

      <nav className="mt-14 flex flex-col gap-10">
        {groups.map((group, index) => (
          <div key={index} className="flex flex-col gap-6">
            {index > 0 && <GroupDivider />}
            {group.map((item) => (
              <NavRow
                key={item.href}
                item={item}
                active={isActive(pathname, item.href, item.href === homeHref)}
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
