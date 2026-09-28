import type { Metadata } from "next";
import { BookOpen, FileQuestion, Users } from "lucide-react";
import { analyticsQuerySchema } from "@gireapp/shared";
import { getAdminAnalytics } from "@/features/admin/analytics";
import { getCourseOptions } from "@/features/admin/students";
import { AnalyticsFilters } from "@/features/admin/analytics-filters";
import { AdminPanel, AdminStatCard } from "@/features/admin/dashboard-cards";
import { RegistrationsChart } from "@/features/admin/registrations-chart";
import { RetentionChart } from "@/features/admin/retention-chart";
import { PassRateChart } from "@/features/admin/pass-rate-chart";
import { TopStudents } from "@/features/admin/top-students";
import { TrackDistribution } from "@/features/admin/track-distribution";
import { TopSubjects } from "@/features/admin/top-subjects";
import { CompletionRate } from "@/features/admin/completion-rate";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track key metrics and performance across the platform",
};

type SearchParams = Record<string, string | string[] | undefined>;

/** Only the first value of a repeated parameter is honoured. */
function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const PERIOD_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;

  // A hand-edited query string must not 500 the page, so anything the shared
  // schema rejects falls back to the unfiltered default range.
  const parsed = analyticsQuerySchema.safeParse({
    rangeDays: firstValue(raw.rangeDays),
    academicLevel: firstValue(raw.academicLevel),
    courseId: firstValue(raw.courseId),
    groupBy: firstValue(raw.groupBy),
  });
  const query = parsed.success ? parsed.data : analyticsQuerySchema.parse({});

  const [analytics, courses] = await Promise.all([
    getAdminAnalytics(query),
    getCourseOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[24px] font-bold text-indigo-950 md:text-[28px]">
          Analytics
        </h1>
        <p className="font-sans text-[16px] text-indigo-400">
          Track key metrics and performance across the platform
        </p>
        {analytics && (
          <p className="font-sans text-[14px] text-indigo-800">
            {PERIOD_FORMAT.format(new Date(analytics.period.from))} —{" "}
            {PERIOD_FORMAT.format(new Date(analytics.period.to))}
          </p>
        )}
      </header>

      <AnalyticsFilters courses={courses} selected={query} />

      {analytics === null ? (
        <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
          We could not load analytics just now. Refresh the page to try again.
        </p>
      ) : (
        <>
          <div className="grid gap-4 rounded-xl bg-indigo-100 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <AdminStatCard
              label="Total Students"
              total={analytics.students}
              icon={Users}
            />
            <AdminStatCard
              label="Total Courses"
              total={analytics.courses}
              icon={BookOpen}
            />
            <AdminStatCard
              label="Total Quizzes"
              total={analytics.quizzes}
              icon={FileQuestion}
            />
          </div>

          {/* The date range only narrows things that happen at a moment in
              time; the rest describe the platform as it stands now. Saying so
              beats leaving the reader to guess why a total ignores the range. */}
          <p className="font-sans text-[13px] text-indigo-800">
            The date range applies to registrations, quiz attempts and new
            enrolments. Totals, track shares, completion and rankings are
            all-time, narrowed only by track and course.
          </p>

          {/* `items-start`: without it every panel stretches to the tallest in its
              row, leaving a short panel with a large empty tail. */}
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <AdminPanel
              title={`New student registrations (last ${analytics.period.rangeDays} days)`}
            >
              <RegistrationsChart
                points={analytics.registrations}
                weekly={analytics.period.groupBy === "WEEKLY"}
              />
            </AdminPanel>

            <AdminPanel title="Track distribution">
              <TrackDistribution shares={analytics.trackDistribution} />
            </AdminPanel>

            {/* Not "completion": an attempt is only recorded once submitted, so
                a completion rate would always read 100%. */}
            <AdminPanel title="Quiz pass rate by subject">
              <PassRateChart subjects={analytics.quizPassRates} />
            </AdminPanel>

            <AdminPanel title="Student retention rate">
              <RetentionChart weeks={analytics.retention} />
            </AdminPanel>

            <AdminPanel title="Top performing students">
              <TopStudents students={analytics.topStudents} />
            </AdminPanel>

            <AdminPanel title="Top subjects by enrolment">
              <TopSubjects subjects={analytics.topSubjects} />
            </AdminPanel>

            <AdminPanel title="Course completion rate">
              <CompletionRate rate={analytics.courseCompletionRate} />
            </AdminPanel>
          </div>
        </>
      )}
    </div>
  );
}
