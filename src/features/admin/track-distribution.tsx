import type { AdminTrackShare } from "@gireapp/shared";
import { DONUT, donutSegments } from "@/features/admin/chart-geometry";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";
import { TRACK_LABELS } from "@/features/admin/track-labels";

const PERCENT = 100;

/** Whole class names, in the order the design colours the ring. */
const SEGMENT_CLASSNAMES = [
  "stroke-indigo-800",
  "stroke-coral-500",
  "stroke-green-500",
];
const LEGEND_CLASSNAMES = ["bg-indigo-800", "bg-coral-500", "bg-green-500"];

/**
 * Arc sizes from the exact counts, not the rounded percentages: three shares
 * of 34/34/28 add up to 96 and leave a visible hole in the ring. The counts
 * always sum to the whole, so the ring always closes.
 */
export function exactShares(shares: AdminTrackShare[]): number[] {
  const tracked = shares.reduce((sum, share) => sum + share.count, 0);
  return shares.map((share) =>
    tracked === 0 ? 0 : (share.count / tracked) * PERCENT,
  );
}

/**
 * Figma "Frame 311" — a donut with the headcount in the hole. The donut and
 * legend sit side by side as in the design; on a phone too narrow for both,
 * the pair scrolls sideways inside the panel rather than squashing the ring.
 */
export function TrackDistribution({ shares }: { shares: AdminTrackShare[] }) {
  if (shares.length === 0) {
    return (
      <AdminPanelEmpty>No students have picked a track yet.</AdminPanelEmpty>
    );
  }

  const tracked = shares.reduce((sum, share) => sum + share.count, 0);
  const segments = donutSegments(exactShares(shares));

  return (
    <div
      tabIndex={0}
      aria-label="Track distribution, scroll horizontally if it does not fit"
      className="scrollbar-slim -m-1 overflow-x-auto overscroll-x-contain p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="mx-auto flex w-max items-center gap-8">
        <div className="relative h-44 w-44 shrink-0 md:h-48 md:w-48">
          <svg
            viewBox={`0 0 ${DONUT.size} ${DONUT.size}`}
            role="img"
            aria-label={shares
              .map(
                (share) =>
                  `${TRACK_LABELS[share.academicLevel] ?? share.academicLevel} ${share.percentage}%`,
              )
              .join(", ")}
            className="h-full w-full -rotate-90"
          >
            {segments.map((segment, index) => (
              <circle
                key={shares[index]?.academicLevel ?? index}
                cx={DONUT.size / 2}
                cy={DONUT.size / 2}
                r={DONUT.radius}
                fill="none"
                strokeWidth={DONUT.strokeWidth}
                strokeDasharray={segment.dashArray}
                strokeDashoffset={segment.dashOffset}
                className={
                  SEGMENT_CLASSNAMES[index % SEGMENT_CLASSNAMES.length]
                }
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-[22px] font-bold text-indigo-950">
              {tracked}
            </span>
            {/* Not "Total Students": learners who have not picked a track
                are counted in the tile above but cannot appear in the ring. */}
            <span className="font-sans text-[13px] text-indigo-800">
              on a track
            </span>
          </div>
        </div>

        <ul className="flex w-[180px] shrink-0 flex-col gap-3">
          {shares.map((share, index) => (
            <li key={share.academicLevel} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 rounded-full ${LEGEND_CLASSNAMES[index % LEGEND_CLASSNAMES.length]}`}
              />
              <span className="flex-1 whitespace-nowrap font-sans text-[14px] text-indigo-950">
                {TRACK_LABELS[share.academicLevel] ?? share.academicLevel}
              </span>
              <span className="font-sans text-[14px] text-indigo-950">
                {share.percentage}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
