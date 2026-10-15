import type { AdminSubjectPassRate } from "@gireapp/shared";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";

const AXIS_MARKS = [100, 75, 50, 25, 0];

/**
 * Figma "Frame 310" — a column per subject. Plain elements rather than SVG:
 * the bars are simple percentages, and this way each one carries its own
 * readable label and value without any co-ordinate maths.
 */
export function PassRateChart({
  subjects,
}: {
  subjects: AdminSubjectPassRate[];
}) {
  if (subjects.length === 0) {
    return (
      <AdminPanelEmpty>No quiz attempts in this period yet.</AdminPanelEmpty>
    );
  }

  return (
    <div className="flex gap-3">
      <div
        aria-hidden="true"
        className="flex h-52 shrink-0 flex-col justify-between text-right font-sans text-[12px] text-indigo-800"
      >
        {AXIS_MARKS.map((mark) => (
          <span key={mark}>{mark}%</span>
        ))}
      </div>

      <ul className="flex min-w-0 flex-1 items-end gap-4 overflow-x-auto">
        {subjects.map((subject) => (
          <li
            key={subject.subject}
            className="flex h-52 min-w-[64px] flex-1 flex-col justify-end gap-2"
          >
            <p className="text-center font-sans text-[13px] text-indigo-950">
              {subject.passRate}%
            </p>
            <div
              role="img"
              aria-label={`${subject.subject}: ${subject.passRate}% of ${subject.attempts} attempts passed`}
              className="w-full rounded-t bg-indigo-800"
              style={{ height: `${subject.passRate}%` }}
            />
            <p className="truncate text-center font-sans text-[12px] text-indigo-800">
              {subject.subject}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
