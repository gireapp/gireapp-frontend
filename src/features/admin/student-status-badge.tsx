import type { StudentStatus } from "@gireapp/shared";
import { cn } from "@/lib/utils";

/** Whole class names — Tailwind's JIT cannot see an interpolated colour. */
const STATUS_STYLES: Record<StudentStatus, string> = {
  ACTIVE: "bg-green-500",
  PENDING: "bg-yellow-500",
  INACTIVE: "bg-red-500",
};

const STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  INACTIVE: "Inactive",
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-[33px] min-w-[89px] items-center justify-center rounded px-3 font-sans text-[14px] text-indigo-50",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
