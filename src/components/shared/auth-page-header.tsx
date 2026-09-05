// ─────────────────────────────────────────────────
// GIREAPP — Auth Page Header
// Back control + title + subtitle, shared by auth screens
// ─────────────────────────────────────────────────

import Link from "next/link";

// The back control is a link when it leaves the flow and a button when it steps
// backwards within one (register). Exactly one of the two is always supplied.
type BackNavigation =
  | { backHref: string; onBack?: never }
  | { onBack: () => void; backHref?: never };

type AuthPageHeaderProps = {
  title: string;
  subtitle: string;
  backLabel: string;
  className?: string;
} & BackNavigation;

const BACK_CONTROL_CLASSNAME =
  "relative h-6 w-6 lg:h-10 lg:w-10 shrink-0 hover:bg-indigo-50/50 rounded-lg transition-colors flex items-center justify-center cursor-pointer";

function BackArrowIcon() {
  return (
    <svg
      className="w-full h-full"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9.1665 20.0034H31.6665"
        stroke="#6366F1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3334 30.0033C18.3334 30.0033 8.33351 22.6383 8.3335 20.0031C8.33348 17.3679 18.3335 10.0032 18.3335 10.0032"
        stroke="#6366F1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthPageHeader({
  title,
  subtitle,
  backLabel,
  className,
  backHref,
  onBack,
}: AuthPageHeaderProps) {
  return (
    <div
      className={`inline-flex w-full max-w-[466px] flex-col items-start gap-2${
        className ? ` ${className}` : ""
      }`}
    >
      <div className="inline-flex items-center justify-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className={BACK_CONTROL_CLASSNAME}
            aria-label={backLabel}
          >
            <BackArrowIcon />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className={BACK_CONTROL_CLASSNAME}
            aria-label={backLabel}
          >
            <BackArrowIcon />
          </button>
        )}
        <h1 className="flex flex-col justify-center text-[20px] lg:text-[28px] font-bold text-indigo-950 font-heading break-words">
          {title}
        </h1>
      </div>
      <p className="w-full text-[14px] lg:text-[16px] text-indigo-950 font-sans font-normal break-words">
        {subtitle}
      </p>
    </div>
  );
}
