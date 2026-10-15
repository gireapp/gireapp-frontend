import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { studentListQuerySchema } from "@gireapp/shared";
import { getCourseOptions, getStudents } from "@/features/admin/students";
import { StudentFilters } from "@/features/admin/student-filters";
import { StudentsTable } from "@/features/admin/students-table";
import { StudentsPagination } from "@/features/admin/students-pagination";
import { ADMIN_HOME_HREF } from "@/features/admin/admin-nav-items";

export const metadata: Metadata = {
  title: "Students",
  description: "Manage and monitor all students on the platform",
};

type SearchParams = Record<string, string | string[] | undefined>;

/** Only the first value of a repeated parameter is honoured. */
function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;

  // A hand-edited query string must not 500 the page, so anything the shared
  // schema rejects falls back to the unfiltered first page.
  const parsed = studentListQuerySchema.safeParse({
    search: firstValue(raw.search),
    courseId: firstValue(raw.courseId),
    academicLevel: firstValue(raw.academicLevel),
    status: firstValue(raw.status),
    page: firstValue(raw.page),
    limit: firstValue(raw.limit),
  });
  const query = parsed.success ? parsed.data : studentListQuerySchema.parse({});

  const [result, courses] = await Promise.all([
    getStudents(query),
    getCourseOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={ADMIN_HOME_HREF}
            aria-label="Back to admin home"
            className="flex h-10 w-10 items-center justify-center rounded text-indigo-950"
          >
            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          </Link>
          <h1 className="font-heading text-[24px] font-bold text-indigo-950 md:text-[28px]">
            Students
          </h1>
        </div>
        <p className="font-sans text-[16px] text-indigo-400">
          Manage and monitor all students on the platform
        </p>
      </header>

      <StudentFilters courses={courses} />

      {result === null ? (
        <StudentsMessage>
          We could not load the student list just now. Refresh the page to try
          again.
        </StudentsMessage>
      ) : result.students.length === 0 ? (
        <StudentsMessage>No students match these filters yet.</StudentsMessage>
      ) : (
        <>
          <StudentsTable students={result.students} />
          <StudentsPagination
            page={result.meta.page}
            limit={result.meta.limit}
            total={result.meta.total}
            totalPages={result.meta.totalPages}
            searchParams={activeParams(query)}
          />
        </>
      )}
    </div>
  );
}

/** The filters worth carrying into a page link — `page` is set by each link. */
function activeParams(query: {
  search?: string;
  courseId?: string;
  academicLevel?: string;
  status?: string;
  limit: number;
}): Record<string, string> {
  const params: Record<string, string> = { limit: String(query.limit) };
  if (query.search) params.search = query.search;
  if (query.courseId) params.courseId = query.courseId;
  if (query.academicLevel) params.academicLevel = query.academicLevel;
  if (query.status) params.status = query.status;
  return params;
}

function StudentsMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded bg-indigo-100 px-4 py-10 text-center font-sans text-[15px] text-indigo-800">
      {children}
    </p>
  );
}
