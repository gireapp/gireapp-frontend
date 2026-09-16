import {
  Home,
  BookOpen,
  Users,
  UserCheck,
  BarChart3,
  ClipboardList,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_HOME } from "@/lib/roles";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_HOME_HREF = ADMIN_HOME;

/**
 * Figma "Student Listing(1440)" — the admin rail. Two groups behind a divider,
 * matching the learner rail's grouping; Logout is rendered separately because
 * it is a form, not a link.
 */
export const ADMIN_NAV_GROUPS: AdminNavItem[][] = [
  [
    { href: ADMIN_HOME_HREF, label: "Home", icon: Home },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/mentors", label: "Mentors", icon: UserCheck },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
  [
    { href: "/admin/quizzes", label: "Quiz Builder", icon: ClipboardList },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
];

/**
 * A row is active for its own route and anything nested beneath it, except
 * Home, whose href is the prefix every other admin route sits under.
 */
export function isAdminNavItemActive(pathname: string, href: string): boolean {
  if (href === ADMIN_HOME_HREF) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
