import { DONUT, donutSegments } from "@/features/admin/chart-geometry";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";

/** Figma "Frame 302" — one filled arc against a track, rate in the middle. */
export function CompletionRate({ rate }: { rate: number | null }) {
  if (rate === null) {
    return (
      <AdminPanelEmpty>No one has enrolled in a course yet.</AdminPanelEmpty>
    );
  }

  // At 0% there is no arc to draw — and a zero-length stroke with a round
  // cap still paints a dot, which reads as a tiny sliver of progress.
  const [segment] = rate > 0 ? donutSegments([rate]) : [];

  return (
    <div className="relative mx-auto h-44 w-44 md:h-48 md:w-48">
      <svg
        viewBox={`0 0 ${DONUT.size} ${DONUT.size}`}
        role="img"
        aria-label={`${rate}% of enrolments completed`}
        className="h-full w-full -rotate-90"
      >
        <circle
          cx={DONUT.size / 2}
          cy={DONUT.size / 2}
          r={DONUT.radius}
          fill="none"
          strokeWidth={DONUT.strokeWidth}
          className="stroke-indigo-200"
        />
        {segment && (
          <circle
            cx={DONUT.size / 2}
            cy={DONUT.size / 2}
            r={DONUT.radius}
            fill="none"
            strokeWidth={DONUT.strokeWidth}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
            strokeLinecap="round"
            className="stroke-indigo-800"
          />
        )}
      </svg>

      <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-[28px] font-bold text-indigo-950">
        {rate}%
      </p>
    </div>
  );
}
