import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Figma shows 1–5, an ellipsis, then the last page. */
const LEADING_PAGES = 5;

const PAGE_CLASSNAME =
  "flex h-[23px] min-w-[24px] items-center justify-center rounded px-1 font-sans text-[12px]";

const STEP_CLASSNAME =
  "flex h-5 w-5 items-center justify-center rounded border border-indigo-200 text-indigo-500";

/**
 * The page numbers to render: the first few, the last one, and an ellipsis
 * between them when pages were skipped. The current page is always included so
 * it can be highlighted even when it falls in the gap.
 */
export function pageNumbers(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const shown = new Set<number>();
  for (let n = 1; n <= Math.min(LEADING_PAGES, totalPages); n += 1)
    shown.add(n);
  shown.add(page);
  shown.add(totalPages);

  const sorted = [...shown]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  return sorted.flatMap((n, index) => {
    const previous = sorted[index - 1];
    return previous !== undefined && n - previous > 1
      ? (["ellipsis", n] as (number | "ellipsis")[])
      : [n];
  });
}

export function StudentsPagination({
  page,
  limit,
  total,
  totalPages,
  searchParams,
}: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  searchParams: Record<string, string>;
}) {
  const hrefForPage = (target: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(target));
    return `/admin/students?${params.toString()}`;
  };

  const firstShown = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastShown = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Student listing pages"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="font-sans text-[12px] text-indigo-500">
        Showing {firstShown} to {lastShown} of {total} results
      </p>

      <div className="flex items-center gap-2">
        <StepLink
          href={hrefForPage(page - 1)}
          disabled={page <= 1}
          label="Previous page"
          icon={<ChevronLeft className="h-3 w-3" aria-hidden="true" />}
        />

        {pageNumbers(page, totalPages).map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              key={`gap-${index}`}
              className={cn(PAGE_CLASSNAME, "text-indigo-500")}
            >
              …
            </span>
          ) : (
            <Link
              key={entry}
              href={hrefForPage(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={cn(
                PAGE_CLASSNAME,
                entry === page
                  ? "bg-indigo-800 text-indigo-50"
                  : "text-indigo-500",
              )}
            >
              {entry}
            </Link>
          ),
        )}

        <StepLink
          href={hrefForPage(page + 1)}
          disabled={page >= totalPages}
          label="Next page"
          icon={<ChevronRight className="h-3 w-3" aria-hidden="true" />}
        />
      </div>
    </nav>
  );
}

function StepLink({
  href,
  disabled,
  label,
  icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-hidden="true" className={cn(STEP_CLASSNAME, "opacity-40")}>
        {icon}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className={STEP_CLASSNAME}>
      {icon}
    </Link>
  );
}
