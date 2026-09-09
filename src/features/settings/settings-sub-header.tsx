import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDashboardOverview } from "@/features/dashboard/actions";
import { DashboardTopbar } from "@/features/dashboard/dashboard-topbar";
import { getSettingsIdentity } from "@/features/settings/profile-identity";

/** Where a settings sub-screen goes back to, unless it says otherwise. */
const SETTINGS_INDEX_HREF = "/dashboard/settings";

/**
 * Header shared by the settings sub-screens: the dashboard topbar on desktop,
 * and a back arrow beside the screen title at both sizes. Figma centres the
 * title on mobile and drops it beside the arrow on desktop.
 */
export async function SettingsSubHeader({
  title,
  backHref = SETTINGS_INDEX_HREF,
  backLabel = "Back to profile and settings",
}: {
  title: string;
  /** Help and Support sit outside the settings tree but are listed within it. */
  backHref?: string;
  backLabel?: string;
}) {
  const [identity, overview] = await Promise.all([
    getSettingsIdentity(),
    getDashboardOverview(),
  ]);

  return (
    <>
      <div className="hidden md:block">
        <DashboardTopbar
          name={identity.name}
          department={identity.department}
          academicLevel={identity.academicLevel}
          points={overview?.totalPoints ?? 0}
        />
      </div>

      <div className="relative flex items-center md:gap-[52px]">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="text-indigo-500 transition-colors hover:text-indigo-800"
        >
          <ArrowLeft
            className="h-6 w-6 md:h-8 md:w-8"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-heading text-[20px] font-bold text-indigo-950 md:static md:translate-x-0 md:text-[28px]">
          {title}
        </h1>
      </div>
    </>
  );
}
