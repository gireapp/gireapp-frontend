// ─────────────────────────────────────────────────
// GIREAPP — Dashboard Layout (M2: Segment Routing)
// Routes users to their segment dashboard
// ─────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardSidebar } from "@/features/dashboard/dashboard-sidebar";
import { DashboardBottomNav } from "@/features/dashboard/dashboard-bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.isOnboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-indigo-50">
      <DashboardSidebar user={{ academicLevel: session.academicLevel }} />
      <DashboardBottomNav academicLevel={session.academicLevel} />

      {/* Figma places desktop content at x=265 against a 240px rail — a 25px
          gutter. Below md the rail becomes the bottom bar, so the padding
          swaps sides: the 53px bar plus breathing room. */}
      <main
        id="main-content"
        className="min-h-screen pb-[85px] md:pb-0 md:pl-[265px]"
      >
        {/* Figma's 80px desktop gutter costs a fifth of a 14" laptop viewport,
            so the full value waits for a screen tall enough to afford it. */}
        <div className="px-4 py-6 md:px-6 md:pr-8 lg:py-10 tall:lg:py-20">
          {children}
        </div>
      </main>
    </div>
  );
}
