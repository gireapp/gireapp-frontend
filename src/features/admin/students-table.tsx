import Image from "next/image";
import type { StudentListItem } from "@gireapp/shared";
import { StudentStatusBadge } from "@/features/admin/student-status-badge";
import { StudentProgress } from "@/features/admin/student-progress";

const TRACK_LABELS: Record<string, string> = {
  SECONDARY: "Secondary",
  TERTIARY: "Tertiary",
  PROFESSIONAL: "Professional",
};

/** The one em dash used wherever the schema has nothing to show. */
const ABSENT = "—";

function trackLabel(academicLevel: string | null): string {
  if (!academicLevel) return ABSENT;
  return TRACK_LABELS[academicLevel] ?? academicLevel;
}

function StudentAvatar({ student }: { student: StudentListItem }) {
  if (student.image) {
    return (
      <Image
        src={student.image}
        alt=""
        width={50}
        height={50}
        className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-indigo-300 font-heading text-[18px] font-bold text-indigo-800"
    >
      {student.name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function StudentsTable({ students }: { students: StudentListItem[] }) {
  return (
    <>
      {/* Figma "Frame 153" — the 1440 table. */}
      <div className="hidden overflow-x-auto rounded bg-indigo-100 md:block">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-indigo-800">
              {["Student", "Course", "Track", "Progress", "Status"].map(
                (heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-4 py-4 font-sans text-[16px] font-medium text-indigo-950"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-b border-indigo-400 last:border-b-0"
              >
                <td className="px-4 py-5">
                  <div className="flex items-center gap-4">
                    <StudentAvatar student={student} />
                    <span className="font-sans text-[14px] text-indigo-950">
                      {student.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-5 font-sans text-[14px] text-indigo-950">
                  {student.course?.title ?? ABSENT}
                </td>
                <td className="px-4 py-5 font-sans text-[14px] text-indigo-950">
                  {trackLabel(student.academicLevel)}
                </td>
                <td className="px-4 py-5">
                  {student.progress === null ? (
                    <span className="font-sans text-[14px] text-indigo-950">
                      {ABSENT}
                    </span>
                  ) : (
                    <StudentProgress progress={student.progress} />
                  )}
                </td>
                <td className="px-4 py-5">
                  <StudentStatusBadge status={student.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Figma "Student listing" (375) — the same rows as stacked cards. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {students.map((student) => (
          <li key={student.id} className="rounded bg-indigo-100 p-2">
            <div className="flex items-center gap-4">
              <StudentAvatar student={student} />
              <div className="min-w-0">
                <p className="truncate font-sans text-[15px] text-indigo-950">
                  {student.name}
                </p>
                <p className="truncate font-sans text-[12px] text-indigo-500">
                  {subtitleOf(student)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between gap-4">
              {student.progress === null ? (
                <span className="font-sans text-[14px] text-indigo-950">
                  {ABSENT}
                </span>
              ) : (
                <StudentProgress progress={student.progress} />
              )}
              <StudentStatusBadge status={student.status} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** "Professional · Data Analytics", dropping whichever half is missing. */
function subtitleOf(student: StudentListItem): string {
  const parts = [
    student.academicLevel ? trackLabel(student.academicLevel) : null,
    student.course?.title ?? null,
  ].filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(" · ") : ABSENT;
}
