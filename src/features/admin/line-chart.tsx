import {
  CHART_VIEWBOX,
  seriesMaximum,
  toPolylinePoints,
} from "@/features/admin/chart-geometry";

/**
 * Room each point gets on the x-axis. Thirty days squeezed into a 343px phone
 * leaves ~11px a point and the lines collapse into spikes, so a plot keeps this
 * much per point and scrolls sideways within its own box instead.
 */
const PIXELS_PER_POINT = 24;

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "30 Jun" — series dates are UTC calendar days from the backend. */
export function formatAxisDate(isoDate: string): string {
  return SHORT_DATE.format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * The indexes that get an x-axis label: every `every` points from the start,
 * plus the final point so the reader always sees where the window ends.
 */
export function axisLabelIndexes(length: number, every = 7): number[] {
  if (length === 0) return [];
  const indexes = new Set<number>();
  for (let index = 0; index < length; index += every) indexes.add(index);
  indexes.add(length - 1);
  return [...indexes].sort((a, b) => a - b);
}

export type ChartSeries = {
  key: string;
  label: string;
  /** Whole class names — Tailwind's JIT cannot see an interpolated colour. */
  strokeClassName: string;
  dotClassName: string;
};

export type ChartPoint = {
  /** x-axis label for this point. */
  label: string;
  /** One value per series key; a missing key is treated as zero. */
  values: Record<string, number>;
};

/**
 * Hand-drawn SVG rather than a charting dependency: polylines over a shared
 * zero-based axis are not worth the bundle. The y-axis always starts at zero —
 * starting it at the series minimum turns "8 yesterday, 10 today" into a cliff.
 */
export function LineChart({
  series,
  points,
  description,
  maxValue,
  labelEvery,
  formatValue = String,
  showDots = false,
}: {
  series: ChartSeries[];
  points: ChartPoint[];
  /** Read aloud in place of the chart. */
  description: string;
  /** Fixes the top of the axis — pass 100 for a percentage chart. */
  maxValue?: number;
  labelEvery?: number;
  formatValue?: (value: number) => string;
  showDots?: boolean;
}) {
  const valuesFor = (key: string) =>
    points.map((point) => point.values[key] ?? 0);
  const peak =
    maxValue ?? seriesMaximum(...series.map((one) => valuesFor(one.key)));
  const lastIndex = points.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {/* The scale stays pinned while the plot scrolls beside it. */}
        <div
          aria-hidden="true"
          className="flex h-48 shrink-0 flex-col justify-between py-0.5 text-right font-sans text-[12px] text-indigo-800"
        >
          <span>{formatValue(peak)}</span>
          <span>{formatValue(0)}</span>
        </div>

        <div
          tabIndex={0}
          aria-label={`${description} — scroll horizontally to see every point`}
          className="scrollbar-slim min-w-0 flex-1 overflow-x-auto overscroll-x-contain rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <div
            className="pb-2 pr-4"
            style={{ minWidth: `${points.length * PIXELS_PER_POINT}px` }}
          >
            <svg
              viewBox={`0 0 ${CHART_VIEWBOX.width} ${CHART_VIEWBOX.height}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={description}
              className="h-48 w-full overflow-visible border-b border-l border-indigo-300"
            >
              {series.map((one) => {
                const drawn = toPolylinePoints(valuesFor(one.key), peak);

                return (
                  <g key={one.key}>
                    <polyline
                      points={drawn}
                      fill="none"
                      strokeWidth={2}
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      className={one.strokeClassName}
                    />
                    {/* A series with a single point draws no visible line, so
                        short series (retention weeks) mark their points. */}
                    {showDots &&
                      drawn
                        .split(" ")
                        .filter(Boolean)
                        .map((pair) => {
                          const [x, y] = pair.split(",");
                          return (
                            <circle
                              key={pair}
                              cx={x}
                              cy={y}
                              r={3}
                              vectorEffect="non-scaling-stroke"
                              className={one.strokeClassName}
                              fill="currentColor"
                            />
                          );
                        })}
                  </g>
                );
              })}
            </svg>

            <div aria-hidden="true" className="relative mt-2 h-4">
              {axisLabelIndexes(points.length, labelEvery).map((index) => {
                const point = points[index];
                if (!point) return null;
                const offset = lastIndex === 0 ? 0 : (index / lastIndex) * 100;

                return (
                  <span
                    key={point.label}
                    className="absolute top-0 whitespace-nowrap font-sans text-[12px] text-indigo-800"
                    style={{
                      left: `${offset}%`,
                      // Pull the first and last labels inside the plot rather
                      // than letting them hang off either end.
                      transform:
                        index === 0
                          ? "none"
                          : index === lastIndex
                            ? "translateX(-100%)"
                            : "translateX(-50%)",
                    }}
                  >
                    {point.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Outside the scroller, so it stays visible however far the plot scrolls. */}
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {series.map((one) => (
          <li key={one.key} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-3 w-3 rounded-full ${one.dotClassName}`}
            />
            <span className="font-sans text-[13px] text-indigo-950">
              {one.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
