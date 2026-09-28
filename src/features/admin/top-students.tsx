import Image from "next/image";
import Link from "next/link";
import type { AdminTopStudent } from "@gireapp/shared";
import { AdminPanelEmpty } from "@/features/admin/dashboard-cards";
import { trackLabel } from "@/features/admin/track-labels";

const ABSENT = "—";

/** Figma "Frame 324" — rank, student, track, points, quizzes. */
export function TopStudents({ students }: { students: AdminTopStudent[] }) {
  if (students.length === 0) {
    return <AdminPanelEmpty>No students match these filters.</AdminPanelEmpty>;
  }

  return (
    <table className="w-full min-w-[420px] border-collapse text-left">
      <thead>
        <tr className="border-b border-indigo-300">
          {["Rank", "Student", "Track", "Points", "Quizzes"].map((heading) => (
            <th
              key={heading}
              scope="col"
              className="px-2 py-2 font-sans text-[14px] font-medium text-indigo-950"
            >
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {students.map((student, index) => (
          <tr
            key={student.id}
            className="border-b border-indigo-200 last:border-b-0"
          >
            <td className="px-2 py-3 font-sans text-[14px] text-indigo-800">
              {index + 1}.
            </td>
            <td className="px-2 py-3">
              <Link
                href={`/admin/students?search=${encodeURIComponent(student.name)}`}
                className="flex items-center gap-2 font-sans text-[14px] text-indigo-950 hover:underline"
              >
                <Avatar student={student} />
                <span className="truncate">{student.name}</span>
              </Link>
            </td>
            <td className="px-2 py-3 font-sans text-[14px] text-indigo-800">
              {trackLabel(student.academicLevel) ?? ABSENT}
            </td>
            <td className="px-2 py-3 font-sans text-[14px] text-indigo-950">
              {student.points}
            </td>
            <td className="px-2 py-3 font-sans text-[14px] text-indigo-950">
              {student.quizzesTaken}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Avatar({ student }: { student: AdminTopStudent }) {
  if (student.image) {
    return (
      <Image
        src={student.image}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-300 font-heading text-[12px] font-bold text-indigo-800"
    >
      {student.name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
