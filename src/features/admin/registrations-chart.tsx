import { ACADEMIC_LEVELS, type AdminRegistrationPoint } from "@gireapp/shared";
import { seriesMaximum } from "@/features/admin/chart-geometry";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";
import { TRACK_LABELS } from "@/features/admin/track-labels";
import {
  LineChart,
  formatAxisDate,
  type ChartSeries,
} from "@/features/admin/line-chart";

/** Same colours as the track donut, so a track reads the same across the page. */
const TRACK_SERIES: ChartSeries[] = [
  {
    key: "SECONDARY",
    label: TRACK_LABELS.SECONDARY ?? "Secondary",
    strokeClassName: "stroke-indigo-800 text-indigo-800",
    dotClassName: "bg-indigo-800",
  },
  {
    key: "TERTIARY",
    label: TRACK_LABELS.TERTIARY ?? "Tertiary",
    strokeClassName: "stroke-coral-500 text-coral-500",
    dotClassName: "bg-coral-500",
  },
  {
    key: "PROFESSIONAL",
    label: TRACK_LABELS.PROFESSIONAL ?? "Professional",
    strokeClassName: "stroke-green-500 text-green-500",
    dotClassName: "bg-green-500",
  },
];

/** Figma "Frame 312" on the analytics screen — one line per track. */
export function RegistrationsChart({
  points,
  weekly,
}: {
  points: AdminRegistrationPoint[];
  weekly: boolean;
}) {
  if (points.length === 0) {
    return <AdminPanelEmpty>No sign-ups in this period yet.</AdminPanelEmpty>;
  }

  const peak = seriesMaximum(
    ...ACADEMIC_LEVELS.map((level) =>
      points.map((point) => point.byTrack[level]),
    ),
  );

  return (
    <LineChart
      series={TRACK_SERIES}
      points={points.map((point) => ({
        label: formatAxisDate(point.date),
        values: point.byTrack,
      }))}
      // Weekly buckets are few enough to label every one; daily would crowd.
      labelEvery={weekly ? 1 : 7}
      showDots={weekly}
      description={`New student registrations by track across ${points.length} ${weekly ? "weeks" : "days"}, peaking at ${peak}`}
    />
  );
}
