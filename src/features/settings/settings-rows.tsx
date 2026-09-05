import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

/** Figma: card holders are indigo-100 at radius 10 on every settings screen. */
export const SETTINGS_CARD_CLASSNAME = "rounded-[10px] bg-indigo-100";

/** Section headings step 16px → 20px between the mobile and desktop frames. */
export const SETTINGS_SECTION_TITLE_CLASSNAME =
  "font-heading text-[16px] font-bold text-indigo-950 md:text-[20px]";

export function SettingsSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-2 md:gap-3 ${className ?? ""}`}>
      {title && <h2 className={SETTINGS_SECTION_TITLE_CLASSNAME}>{title}</h2>}
      {/* Figma separates stacked rows with a hairline that stops short of the
          card edges, hence the inset border rather than a full-width rule. */}
      <div
        className={`${SETTINGS_CARD_CLASSNAME} flex flex-col [&>*+*]:border-t [&>*+*]:border-indigo-300/60`}
      >
        {children}
      </div>
    </section>
  );
}

type SettingsRowProps = {
  icon: LucideIcon;
  label: string;
  /** Secondary line beneath the label — the current value, where a row has one. */
  value?: string | null;
  href?: string;
};

/**
 * One tappable row inside a settings card. Rows without an `href` render as
 * plain markup rather than a dead link, so a destination that does not exist
 * yet cannot look interactive.
 */
export function SettingsRow({
  icon: Icon,
  label,
  value,
  href,
}: SettingsRowProps) {
  const body = (
    <>
      <Icon
        className="h-8 w-8 shrink-0 text-indigo-950"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-sans text-[14px] text-indigo-950 md:text-[16px]">
          {label}
        </span>
        {value && (
          <span className="truncate font-sans text-[12px] text-indigo-400 md:text-[14px]">
            {value}
          </span>
        )}
      </span>
      {href && (
        <ChevronRight
          className="h-8 w-8 shrink-0 text-indigo-400"
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
    </>
  );

  const shared = "flex items-center gap-3 px-2 py-3 md:px-4";

  if (!href) {
    return <div className={shared}>{body}</div>;
  }

  return (
    <Link
      href={href}
      className={`${shared} rounded-[10px] transition-colors hover:bg-indigo-200/60`}
    >
      {body}
    </Link>
  );
}
