/**
 * Geometry for the two hand-rolled charts. Kept free of React and of any
 * pixel sizes so it can be unit-tested and so the SVGs stay responsive: both
 * charts draw into a normalised viewBox and are scaled by CSS.
 */

export const CHART_VIEWBOX = { width: 100, height: 60 } as const;

/** Circumference-relative geometry: the donut is drawn in a 100×100 box. */
export const DONUT = { size: 100, radius: 40, strokeWidth: 12 } as const;

const FULL_TURN_DEGREES = 360;
const PERCENT = 100;

/**
 * Maps a series onto the viewBox. The y-axis always starts at zero — a chart
 * that starts at the minimum exaggerates small movements into cliffs — and a
 * flat series is drawn along the bottom rather than divided by a zero range.
 */
export function toPolylinePoints(values: number[], maxValue: number): string {
  if (values.length === 0) return "";

  const { width, height } = CHART_VIEWBOX;
  const span = Math.max(maxValue, 1);
  const step = values.length === 1 ? 0 : width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / span) * height;
      return `${round(x)},${round(y)}`;
    })
    .join(" ");
}

/** The tallest value across every series, so both share one y-axis. */
export function seriesMaximum(...series: number[][]): number {
  return series.flat().reduce((highest, value) => Math.max(highest, value), 0);
}

export type DonutSegment = {
  /** Length of the drawn arc, in the same units as `dashArray`'s gap. */
  dashArray: string;
  dashOffset: number;
};

/**
 * Lays percentages out around the ring as stroke dash offsets. Using one
 * circle per segment rather than arc paths keeps the maths to a single
 * circumference and avoids the large-arc-flag edge case at exactly 50%.
 */
export function donutSegments(percentages: number[]): DonutSegment[] {
  const circumference = 2 * Math.PI * DONUT.radius;
  let consumed = 0;

  return percentages.map((percentage) => {
    const length = (clampPercent(percentage) / PERCENT) * circumference;
    const segment = {
      dashArray: `${round(length)} ${round(circumference - length)}`,
      // Negative: SVG dash offsets run backwards around the circle.
      dashOffset: -round(consumed),
    };
    consumed += length;
    return segment;
  });
}

/** Degrees of the ring a single percentage occupies — used for aria labels. */
export function percentToDegrees(percentage: number): number {
  return round((clampPercent(percentage) / PERCENT) * FULL_TURN_DEGREES);
}

function clampPercent(percentage: number): number {
  if (!Number.isFinite(percentage) || percentage < 0) return 0;
  return Math.min(percentage, PERCENT);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
