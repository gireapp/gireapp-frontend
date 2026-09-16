import type { AdminGrowthPoint } from "@gireapp/shared";
import {
  CHART_VIEWBOX,
  seriesMaximum,
  toPolylinePoints,
} from "@/features/admin/chart-geometry";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";

const SERIES = [
  {
    key: "registered",
    label: "Registered students",
    stroke: "stroke-indigo-800",
    dot: "bg-indigo-800",
  },
  {
    key: "active",
    label: "Active students",
    stroke: "stroke-coral-500",
    dot: "bg-coral-500",
  },
] as const;

/**
 * Room each day gets on the x-axis. Thirty days squeezed into a 343px phone
 * leaves ~11px a day and the lines collapse into spikes, so the plot keeps
 * this much per point and scrolls sideways within its own box instead.
 */
const PIXELS_PER_DAY = 24;

/** A date label every week keeps the axis readable without crowding. */
const LABEL_EVERY_DAYS = 7;

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "30 Jun" — the series dates are UTC calendar days from the backend. */
export function formatAxisDate(isoDate: string): string {
  return SHORT_DATE.format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * The indexes that get a date label: every week from the start, plus the
 * final day so the reader always sees where the window ends.
 */
export function axisLabelIndexes(length: number): number[] {
  if (length === 0) return [];
  const indexes = new Set<number>();
  for (let index = 0; index < length; index += LABEL_EVERY_DAYS) {
    indexes.add(index);
  }
  indexes.add(length - 1);
  return [...indexes].sort((a, b) => a - b);
}

/**
 * Figma "Frame 312". Hand-drawn SVG rather than a charting dependency: two
 * polylines over a shared zero-based axis is not worth 100kB of library.
 */
export function GrowthChart({ points }: { points: AdminGrowthPoint[] }) {
  if (points.length === 0) {
    return (
      <AdminPanelEmpty>
        No sign-ups or activity in the last 30 days yet.
      </AdminPanelEmpty>
    );
  }

  const registered = points.map((point) => point.registered);
  const active = points.map((point) => point.active);
  const peak = seriesMaximum(registered, active);
  const values = { registered, active };
  const lastIndex = points.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {/* The scale stays pinned while the plot scrolls beside it. */}
        <div
          aria-hidden="true"
          className="flex h-48 shrink-0 flex-col justify-between py-0.5 text-right font-sans text-[12px] text-indigo-800"
        >
          <span>{peak}</span>
          <span>0</span>
        </div>

        <div
          tabIndex={0}
          aria-label="Student growth chart, scroll horizontally to see every day"
          className="scrollbar-slim min-w-0 flex-1 overflow-x-auto overscroll-x-contain rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <div
            className="pb-2 pr-4"
            style={{ minWidth: `${points.length * PIXELS_PER_DAY}px` }}
          >
            <svg
              viewBox={`0 0 ${CHART_VIEWBOX.width} ${CHART_VIEWBOX.height}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`Daily registered and active students over the last ${points.length} days, peaking at ${peak}`}
              className="h-48 w-full overflow-visible border-b border-l border-indigo-300"
            >
              {SERIES.map((series) => (
                <polyline
                  key={series.key}
                  points={toPolylinePoints(values[series.key], peak)}
                  fill="none"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className={series.stroke}
                />
              ))}
            </svg>

            <div aria-hidden="true" className="relative mt-2 h-4">
              {axisLabelIndexes(points.length).map((index) => {
                const point = points[index];
                if (!point) return null;
                const offset = lastIndex === 0 ? 0 : (index / lastIndex) * 100;

                return (
                  <span
                    key={point.date}
                    className="absolute top-0 whitespace-nowrap font-sans text-[12px] text-indigo-800"
                    style={{
                      left: `${offset}%`,
                      // Pull the last label back inside the edge rather than
                      // letting it hang off the end of the plot.
                      transform:
                        index === 0
                          ? "none"
                          : index === lastIndex
                            ? "translateX(-100%)"
                            : "translateX(-50%)",
                    }}
                  >
                    {formatAxisDate(point.date)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-3 w-3 rounded-full ${series.dot}`}
            />
            <span className="font-sans text-[13px] text-indigo-950">
              {series.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
