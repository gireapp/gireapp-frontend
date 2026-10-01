import type { LucideIcon } from "lucide-react";
import type { AdminTotal } from "@gireapp/shared";

/** Figma "Frame 215" — an icon disc beside a label, a count and a delta. */
export function AdminStatCard({
  label,
  total,
  icon: Icon,
}: {
  label: string;
  total: AdminTotal;
  icon: LucideIcon;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-lg bg-indigo-50 p-4 md:p-6">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100"
      >
        <Icon className="h-6 w-6 text-indigo-800" />
      </span>
      <div className="min-w-0">
        <p className="font-sans text-[14px] text-indigo-800">{label}</p>
        <p className="font-heading text-[24px] font-bold text-indigo-950">
          {total.value}
        </p>
        {total.addedThisWeek > 0 && (
          <p className="font-sans text-[12px] text-green-500">
            +{total.addedThisWeek} this week
          </p>
        )}
      </div>
    </div>
  );
}

/** The panel every chart and list on the dashboard sits in. */
export function AdminPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    // `min-w-0`: a grid item defaults to `min-width: auto`, so unwrapped text
    // or a wide chart inside would stretch the whole column past the screen.
    <section className="flex min-w-0 flex-col gap-3">
      <h2 className="font-heading text-[18px] font-bold text-indigo-950">
        {title}
      </h2>
      {/* Anything wider than the panel scrolls here, not the page. */}
      <div className="scrollbar-slim overflow-x-auto overscroll-x-contain rounded-lg bg-indigo-100 p-4 md:p-6">
        {children}
      </div>
    </section>
  );
}

export function AdminPanelEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-8 text-center font-sans text-[14px] text-indigo-800">
      {children}
    </p>
  );
}
