"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getBottomNavItems,
  homeHref,
  isNavItemActive,
} from "@/features/dashboard/nav-items";

/** Figma mobile: 53px indigo-800 bar, five 40px targets, icon over a 12px label. */
export function DashboardBottomNav({
  academicLevel,
}: {
  academicLevel: string | null;
}) {
  const pathname = usePathname();
  const items = getBottomNavItems(academicLevel);
  const home = homeHref(academicLevel);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[53px] items-center justify-around bg-indigo-800 px-4 md:hidden"
      aria-label="Dashboard navigation"
    >
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href, item.href === home);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-10 flex-col items-center gap-1 transition-colors",
              active
                ? "text-indigo-50"
                : "text-indigo-300 hover:text-indigo-50",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="font-sans text-[12px] leading-none">
              {item.shortLabel ?? item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
