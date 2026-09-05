import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getDashboardOverview } from "@/features/dashboard/actions";
import { DashboardHome } from "@/features/dashboard/dashboard-home";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalised GIREAPP dashboard.",
};

export default async function SecondaryDashboard() {
  const [session, overview] = await Promise.all([
    getSession(),
    getDashboardOverview(),
  ]);

  return (
    <DashboardHome
      name={overview?.profile.name ?? session?.email ?? "there"}
      department={overview?.profile.department ?? session?.department ?? null}
      overview={overview}
    />
  );
}
