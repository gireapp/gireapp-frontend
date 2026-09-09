"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { GireappLogo } from "@/components/shared/gireapp-logo";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/features/auth/actions";
import {
  ADMIN_HOME_HREF,
  ADMIN_NAV_GROUPS,
  isAdminNavItemActive,
  type AdminNavItem,
} from "@/features/admin/admin-nav-items";
import type { StaffIdentity } from "@/features/admin/staff-identity";

/** Matches the learner rail so the two shells feel like one product. */
const ROW_CLASSNAME =
  "flex h-10 w-fit items-center gap-3 whitespace-nowrap rounded-lg px-3 font-sans text-[15px] transition-colors tall:h-12 tall:text-[16px]";

const ROW_ICON_CLASSNAME = "h-5 w-5 shrink-0 tall:h-6 tall:w-6";

function NavRow({ item, active }: { item: AdminNavItem; active: boolean }) {
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

export function AdminSidebar({ staff }: { staff: StaffIdentity }) {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-indigo-800 pl-8 pr-2 pt-6 md:flex tall:pt-[75px]"
      aria-label="Admin navigation"
    >
      <GireappLogo
        surface="onDark"
        height={32}
        href={ADMIN_HOME_HREF}
        priority
      />

      <div className="scrollbar-slim flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-4 taller:pb-10">
        <nav className="mt-6 flex shrink-0 flex-col gap-3 tall:mt-14 tall:gap-10">
          {ADMIN_NAV_GROUPS.map((group, index) => (
            <div key={index} className="flex flex-col gap-2 tall:gap-6">
              {index > 0 && (
                <hr
                  className="border-0 border-t border-indigo-50"
                  aria-hidden="true"
                />
              )}
              {group.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  active={isAdminNavItemActive(pathname, item.href)}
                />
              ))}
            </div>
          ))}

          <div className="flex flex-col gap-2 tall:gap-6">
            <hr
              className="border-0 border-t border-indigo-50"
              aria-hidden="true"
            />
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

        <StaffCard staff={staff} />
      </div>
    </aside>
  );
}

/** Figma "Frame 88" — the account card pinned to the foot of the rail. */
function StaffCard({ staff }: { staff: StaffIdentity }) {
  return (
    <div className="mt-auto hidden shrink-0 pt-6 tall:block">
      <Link
        href="/admin/settings"
        className="flex items-center gap-3 rounded-lg bg-indigo-950 p-2.5 transition-colors hover:bg-indigo-950/80"
      >
        <StaffAvatar staff={staff} />
        <span className="min-w-0 flex-1">
          {staff.name && (
            <span className="block truncate font-sans text-[13px] text-indigo-50">
              {staff.name}
            </span>
          )}
          <span className="block truncate font-sans text-[11px] text-indigo-300">
            {staff.roleLabel}
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-indigo-300"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

function StaffAvatar({ staff }: { staff: StaffIdentity }) {
  if (staff.image) {
    return (
      <Image
        src={staff.image}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-400 font-heading text-[15px] font-bold text-indigo-50"
    >
      {initialOf(staff.name ?? staff.roleLabel)}
    </span>
  );
}

function initialOf(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "?";
}
