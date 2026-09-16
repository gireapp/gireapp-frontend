import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileQuestion, Plus, Users } from "lucide-react";
import { getStaffIdentity } from "@/features/admin/staff-identity";
import { getAdminOverview } from "@/features/admin/overview";
import { AdminPanel, AdminStatCard } from "@/features/admin/dashboard-cards";
import { GrowthChart } from "@/features/admin/growth-chart";
import { TrackDistribution } from "@/features/admin/track-distribution";
import { RecentActivity } from "@/features/admin/recent-activity";
import { TopSubjects } from "@/features/admin/top-subjects";
import { CompletionRate } from "@/features/admin/completion-rate";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "What is happening on GIREAPP today",
};

/**
 * The design also shows Total Mentors, Certificates Issued, a live-presence
 * banner and a "Generate report" action. Nothing in the schema backs any of
 * them, so they are absent rather than stubbed with invented numbers.
 */
const QUICK_ACTIONS = [
  { href: "/admin/quizzes/new", label: "Create new quiz" },
  { href: "/admin/courses/new", label: "Add new course" },
];

export default async function AdminDashboardPage() {
  const [staff, overview] = await Promise.all([
    getStaffIdentity(),
    getAdminOverview(),
  ]);

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[24px] font-bold text-indigo-950 md:text-[28px]">
          {staff.name ? `Hello, ${staff.name}!` : "Hello!"}
        </h1>
        <p className="font-sans text-[16px] text-indigo-400">
          Here&rsquo;s what&rsquo;s happening on GIREAPP today
        </p>
      </header>

      {overview === null ? (
        <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
          We could not load the dashboard just now. Refresh the page to try
          again.
        </p>
      ) : (
        <>
          <div className="grid gap-4 rounded-xl bg-indigo-100 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <AdminStatCard
              label="Total Students"
              total={overview.students}
              icon={Users}
            />
            <AdminStatCard
              label="Total Courses"
              total={overview.courses}
              icon={BookOpen}
            />
            <AdminStatCard
              label="Total Quizzes"
              total={overview.quizzes}
              icon={FileQuestion}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title="Student growth (last 30 days)">
              <GrowthChart points={overview.growth} />
            </AdminPanel>

            <AdminPanel title="Track distribution">
              <TrackDistribution shares={overview.trackDistribution} />
            </AdminPanel>

            <AdminPanel title="Recent activity">
              <RecentActivity activity={overview.recentActivity} />
            </AdminPanel>

            <AdminPanel title="Quick actions">
              <ul className="flex flex-col gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <li key={action.href}>
                    <Link
                      href={action.href}
                      className="flex items-center gap-4 rounded-lg border border-green-500 px-4 py-3 transition-colors hover:bg-indigo-50"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100"
                      >
                        <Plus className="h-5 w-5 text-indigo-800" />
                      </span>
                      <span className="font-sans text-[15px] text-indigo-950">
                        {action.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </AdminPanel>

            <AdminPanel title="Top subjects by enrolment">
              <TopSubjects subjects={overview.topSubjects} />
            </AdminPanel>

            <AdminPanel title="Course completion rate">
              <CompletionRate rate={overview.courseCompletionRate} />
            </AdminPanel>
          </div>
        </>
      )}
    </div>
  );
}
