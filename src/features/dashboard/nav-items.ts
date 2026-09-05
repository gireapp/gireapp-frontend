import {
  Home,
  BookOpen,
  TrendingUp,
  Users,
  UserCircle,
  HelpCircle,
  Headphones,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** Shorter label for the bottom bar, where five items share 375px. */
  shortLabel?: string;
  icon: LucideIcon;
};

const SEGMENT_MAP: Record<string, string> = {
  SECONDARY: "/dashboard/secondary",
  TERTIARY: "/dashboard/tertiary",
  PROFESSIONAL: "/dashboard/professional",
};

export function homeHref(academicLevel: string | null): string {
  return (academicLevel && SEGMENT_MAP[academicLevel]) || "/dashboard";
}

/**
 * The rail groups these behind dividers; the bottom bar shows only the first
 * group plus Profile. Both read from here so a route can't drift between them.
 */
export function getNavGroups(academicLevel: string | null): NavItem[][] {
  return [
    [
      { href: homeHref(academicLevel), label: "Home", icon: Home },
      { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
      { href: "/dashboard/progress", label: "Progress", icon: TrendingUp },
      { href: "/dashboard/mentors", label: "Mentors", icon: Users },
    ],
    [
      {
        href: "/dashboard/settings",
        label: "Profile & Settings",
        shortLabel: "Profile",
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

/** Bottom bar: the four primary destinations plus Profile. */
export function getBottomNavItems(academicLevel: string | null): NavItem[] {
  const groups = getNavGroups(academicLevel);
  return [...(groups[0] ?? []), ...(groups[1] ?? [])];
}

/**
 * A row is active for its own route and anything nested beneath it, except
 * "Home", whose href is a segment root that every other route also sits under.
 */
export function isNavItemActive(
  pathname: string,
  href: string,
  isHome: boolean,
): boolean {
  if (isHome) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
