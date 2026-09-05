import { CircleCheck, CircleX, Info, Loader2 } from "lucide-react";

/** The one element carrying a form's outcome, referenced by any invalid field. */
export const SETTINGS_STATUS_ELEMENT_ID = "settings-form-status";

/** Figma insets every settings label 12px, matching the field's own padding. */
export const SETTINGS_LABEL_CLASSNAME =
  "pl-3 font-heading text-[16px] font-bold text-indigo-950 md:text-[20px]";

/** The field frame: 54px on mobile, 64px on desktop, radius 10, hairline border. */
export const SETTINGS_FIELD_CLASSNAME =
  "h-[54px] w-full rounded-[10px] border px-3 font-sans text-[12px] text-indigo-950 placeholder:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 md:h-16 md:text-[16px]";

export type SettingsStatusVariant = "info" | "success" | "error";

/**
 * Written out rather than interpolated — Tailwind only ever sees whole class
 * names, so a generated `border-${colour}` would compile to nothing.
 */
const STATUS_STYLES = {
  info: {
    Icon: Info,
    border: "md:border-indigo-800",
    mark: "text-indigo-500",
    text: "text-indigo-950",
  },
  success: {
    Icon: CircleCheck,
    border: "md:border-green-500",
    mark: "fill-green-500 text-indigo-50",
    text: "text-green-500",
  },
  error: {
    Icon: CircleX,
    border: "md:border-red-500",
    mark: "fill-red-500 text-indigo-50",
    text: "text-red-500",
  },
} satisfies Record<SettingsStatusVariant, unknown>;

/**
 * The panel beside a settings form: guidance before submitting, the outcome
 * after. Figma draws it as a single line on mobile and a bordered card with a
 * large mark on desktop.
 */
export function SettingsStatusPanel({
  variant,
  message,
  detail,
}: {
  variant: SettingsStatusVariant;
  message: string;
  detail?: string;
}) {
  const { Icon, border, mark, text } = STATUS_STYLES[variant];

  return (
    <div
      id={SETTINGS_STATUS_ELEMENT_ID}
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-center gap-4 rounded-[10px] bg-indigo-50 p-3 md:flex-col md:justify-center md:gap-6 md:border md:px-6 md:py-12 ${border}`}
    >
      <Icon
        className={`h-6 w-6 shrink-0 md:h-[120px] md:w-[120px] ${mark}`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="md:text-center">
        {/* The copy carries its own line breaks in the design. */}
        <p
          className={`whitespace-pre-line font-sans text-[12px] md:text-[16px] ${text}`}
        >
          {message}
        </p>
        {detail && (
          <p className="mt-1 font-sans text-[12px] text-indigo-800 md:mt-2 md:text-[14px]">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The shared geometry of the settings sub-screens: a 467px field column, the
 * status panel alongside it, and a centred Save button well below both.
 */
export function SettingsFormLayout({
  action,
  panel,
  isPending,
  isDisabled,
  children,
}: {
  action: (formData: FormData) => void;
  panel: React.ReactNode;
  isPending: boolean;
  isDisabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={action} className="flex flex-col gap-14 md:gap-24">
      {/* Figma hangs the side panel lower than the fields; centring it against
          the column lands in the same place without pinning a magic offset. */}
      <div className="flex flex-col gap-[30px] md:flex-row md:items-center md:justify-between md:gap-16">
        <div className="flex flex-col gap-[14px] md:w-[467px] md:gap-6">
          {children}
        </div>
        <div className="md:w-[320px]">{panel}</div>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-coral-500 font-heading text-[16px] font-bold text-indigo-50 transition-colors hover:bg-coral-600 disabled:bg-indigo-200 disabled:hover:bg-indigo-200 md:mx-auto md:h-12 md:w-[443px]"
      >
        {isPending && (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        )}
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
