import type { AdminRetentionWeek } from "@gireapp/shared";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";
import { LineChart, type ChartSeries } from "@/features/admin/line-chart";

const PERCENT_MAX = 100;

const RETENTION_SERIES: ChartSeries[] = [
  {
    key: "rate",
    label: "Still active",
    strokeClassName: "stroke-indigo-800 text-indigo-800",
    dotClassName: "bg-indigo-800",
  },
];

/**
 * Figma "Frame 313". Weeks where nobody has been signed up long enough are
 * dropped rather than drawn as zero — "too soon to tell" is not "nobody came
 * back", and plotting it as 0% would invent a cliff.
 */
export function RetentionChart({ weeks }: { weeks: AdminRetentionWeek[] }) {
  const measured = weeks.filter(
    (week): week is AdminRetentionWeek & { rate: number } => week.rate !== null,
  );

  if (measured.length === 0) {
    return (
      <AdminPanelEmpty>
        No one in this period has been signed up a full week yet.
      </AdminPanelEmpty>
    );
  }

  const cohort = Math.max(...measured.map((week) => week.eligible));

  return (
    <div className="flex flex-col gap-3">
      <LineChart
        series={RETENTION_SERIES}
        points={measured.map((week) => ({
          label: `Week ${week.week}`,
          values: { rate: week.rate },
        }))}
        maxValue={PERCENT_MAX}
        labelEvery={1}
        showDots
        formatValue={(value) => `${value}%`}
        description={measured
          .map((week) => `week ${week.week} ${week.rate}%`)
          .join(", ")}
      />
      <p className="font-sans text-[12px] text-indigo-800">
        Share of the {cohort} students who signed up in this period that
        finished a lesson or sat a quiz in each week after signing up.
      </p>
    </div>
  );
}
