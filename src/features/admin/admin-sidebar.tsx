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

/**
 * Where the nav is rendered. The rail steps its spacing down on short laptop
 * screens and drops the account card there; the mobile drawer has the whole
 * screen height to itself, so it always shows both at full size.
 */
export type AdminNavVariant = "rail" | "drawer";

/** Matches the learner rail so the two shells feel like one product. */
const ROW_CLASSNAME: Record<AdminNavVariant, string> = {
  rail: "flex h-10 w-fit items-center gap-3 whitespace-nowrap rounded-lg px-3 font-sans text-[15px] transition-colors tall:h-12 tall:text-[16px]",
  drawer:
    "flex h-12 w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 font-sans text-[16px] transition-colors",
};

const ROW_ICON_CLASSNAME: Record<AdminNavVariant, string> = {
  rail: "h-5 w-5 shrink-0 tall:h-6 tall:w-6",
  drawer: "h-6 w-6 shrink-0",
};

const GROUP_GAP_CLASSNAME: Record<AdminNavVariant, string> = {
  rail: "gap-3 tall:gap-10",
  drawer: "gap-6",
};

const ROW_GAP_CLASSNAME: Record<AdminNavVariant, string> = {
  rail: "gap-2 tall:gap-6",
  drawer: "gap-2",
};

function GroupDivider() {
  return (
    <hr className="border-0 border-t border-indigo-50" aria-hidden="true" />
  );
}

function NavRow({
  item,
  active,
  variant,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  variant: AdminNavVariant;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        ROW_CLASSNAME[variant],
        active
          ? "bg-indigo-400 text-indigo-50"
          : "text-indigo-400 hover:bg-indigo-400/20 hover:text-indigo-50",
      )}
    >
      <Icon className={ROW_ICON_CLASSNAME[variant]} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

/**
 * The links, Logout and the account card — everything below the logo. Shared
 * by the desktop rail and the mobile drawer so a route cannot be added to one
 * and forgotten in the other.
 */
export function AdminNavBody({
  staff,
  variant,
  onNavigate,
}: {
  staff: StaffIdentity;
  variant: AdminNavVariant;
  /** Lets the drawer close itself when a link is followed. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* `shrink-0`: as a flex child the nav would otherwise squash its rows
          rather than let the container scroll. */}
      <nav
        aria-label="Admin"
        className={cn("flex shrink-0 flex-col", GROUP_GAP_CLASSNAME[variant])}
      >
        {ADMIN_NAV_GROUPS.map((group, index) => (
          <div
            key={index}
            className={cn("flex flex-col", ROW_GAP_CLASSNAME[variant])}
          >
            {index > 0 && <GroupDivider />}
            {group.map((item) => (
              <NavRow
                key={item.href}
                item={item}
                variant={variant}
                onNavigate={onNavigate}
                active={isAdminNavItemActive(pathname, item.href)}
              />
            ))}
          </div>
        ))}

        <div className={cn("flex flex-col", ROW_GAP_CLASSNAME[variant])}>
          <GroupDivider />
          <form action={logoutAction}>
            <button
              type="submit"
              className={cn(
                ROW_CLASSNAME[variant],
                "w-full text-indigo-400 hover:bg-indigo-400/20 hover:text-indigo-50",
              )}
            >
              <LogOut
                className={cn(ROW_ICON_CLASSNAME[variant], "text-red-500")}
                aria-hidden="true"
              />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </nav>

      <StaffCard staff={staff} variant={variant} onNavigate={onNavigate} />
    </>
  );
}

export function AdminSidebar({ staff }: { staff: StaffIdentity }) {
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

      {/* The rail can be taller than a 14" laptop viewport, so everything
          below the logo scrolls. Without `min-h-0` a flex child refuses to
          shrink below its content and the overflow is unreachable. */}
      <div className="scrollbar-slim mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-4 tall:mt-14 taller:pb-10">
        <AdminNavBody staff={staff} variant="rail" />
      </div>
    </aside>
  );
}

/** Figma "Frame 88" — the account card pinned to the foot of the nav. */
function StaffCard({
  staff,
  variant,
  onNavigate,
}: {
  staff: StaffIdentity;
  variant: AdminNavVariant;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={cn(
        "mt-auto shrink-0 pt-6",
        // Short laptop screens spend their rail height on links, not the card.
        variant === "rail" && "hidden tall:block",
      )}
    >
      <Link
        href="/admin/settings"
        onClick={onNavigate}
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
