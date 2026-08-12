// ─────────────────────────────────────────────────
// GIREAPP — Dashboard Layout (M2: Segment Routing)
// Routes users to their segment dashboard
// ─────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardSidebar } from "@/features/dashboard/dashboard-sidebar";

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

      {/* Figma places content at x=265 against a 240px rail — a 25px gutter. */}
      <main
        id="main-content"
        className="min-h-screen pb-20 lg:pb-0 lg:pl-[265px]"
      >
        <div className="px-4 py-6 pr-4 md:px-6 lg:py-20 lg:pr-8">
          {children}
        </div>
      </main>
    </div>
  );
}
