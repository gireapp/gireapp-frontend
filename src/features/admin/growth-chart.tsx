import type { AdminGrowthPoint } from "@gireapp/shared";
import { seriesMaximum } from "@/features/admin/chart-geometry";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";
import {
  LineChart,
  formatAxisDate,
  type ChartSeries,
} from "@/features/admin/line-chart";

const SERIES: ChartSeries[] = [
  {
    key: "registered",
    label: "Registered students",
    strokeClassName: "stroke-indigo-800 text-indigo-800",
    dotClassName: "bg-indigo-800",
  },
  {
    key: "active",
    label: "Active students",
    strokeClassName: "stroke-coral-500 text-coral-500",
    dotClassName: "bg-coral-500",
  },
];

/** Figma "Frame 312" — daily sign-ups against daily active learners. */
export function GrowthChart({ points }: { points: AdminGrowthPoint[] }) {
  if (points.length === 0) {
    return (
      <AdminPanelEmpty>
        No sign-ups or activity in the last 30 days yet.
      </AdminPanelEmpty>
    );
  }

  const peak = seriesMaximum(
    points.map((point) => point.registered),
    points.map((point) => point.active),
  );

  return (
    <LineChart
      series={SERIES}
      points={points.map((point) => ({
        label: formatAxisDate(point.date),
        values: { registered: point.registered, active: point.active },
      }))}
      description={`Daily registered and active students over the last ${points.length} days, peaking at ${peak}`}
    />
  );
}
