import type { AdminSubjectEnrolments } from "@gireapp/shared";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";

const PERCENT = 100;

/** Figma "Frame 300" — bars scaled against the busiest subject, not a total. */
export function TopSubjects({
  subjects,
}: {
  subjects: AdminSubjectEnrolments[];
}) {
  if (subjects.length === 0) {
    return <AdminPanelEmpty>No enrolments to rank yet.</AdminPanelEmpty>;
  }

  const busiest = subjects.reduce(
    (highest, subject) => Math.max(highest, subject.enrolments),
    0,
  );

  return (
    <ul className="flex flex-col gap-4">
      {subjects.map((subject) => (
        <li key={subject.subject} className="flex items-center gap-4">
          <span className="w-32 shrink-0 truncate font-sans text-[14px] text-indigo-950">
            {subject.subject}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-indigo-200">
            <span
              className="block h-full rounded-full bg-indigo-800"
              style={{
                width: `${busiest === 0 ? 0 : (subject.enrolments / busiest) * PERCENT}%`,
              }}
            />
          </span>
          <span className="w-10 shrink-0 text-right font-sans text-[14px] text-indigo-950">
            {subject.enrolments}
          </span>
        </li>
      ))}
    </ul>
  );
}
