"use client";

import { useState } from "react";
import { CircleCheck, CircleX, Eye, EyeOff, Info, Loader2 } from "lucide-react";

/** The one element carrying a form's outcome, referenced by any invalid field. */
export const SETTINGS_STATUS_ELEMENT_ID = "settings-form-status";

/** Figma insets every settings label 12px, matching the field's own padding. */
export const SETTINGS_LABEL_CLASSNAME =
  "pl-3 font-heading text-[16px] font-bold text-indigo-950 md:text-[20px]";

/** The field frame: 54px on mobile, 64px on desktop, radius 10, hairline border. */
export const SETTINGS_FIELD_CLASSNAME =
  "h-[54px] w-full rounded-[10px] border px-3 font-sans text-[12px] text-indigo-950 placeholder:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 md:h-16 md:text-[16px]";

/**
 * A labelled field with a show/hide toggle, shared by every settings screen that
 * asks for a password.
 */
export function SettingsPasswordField({
  name,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
  isInvalid,
  isDisabled,
}: {
  name: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  /** Shown beneath the field. Omit to flag the border only and leave the reason
   *  to the status panel, which is how the password screen is drawn. */
  error?: string;
  isInvalid?: boolean;
  isDisabled: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ToggleIcon = isVisible ? Eye : EyeOff;
  const invalid = isInvalid ?? Boolean(error);

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={name} className={SETTINGS_LABEL_CLASSNAME}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isVisible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={isDisabled}
          aria-invalid={invalid ? "true" : undefined}
          aria-describedby={
            error
              ? `${name}-error`
              : invalid
                ? SETTINGS_STATUS_ELEMENT_ID
                : undefined
          }
          className={`${SETTINGS_FIELD_CLASSNAME} bg-transparent pr-11 md:pr-14 ${
            invalid ? "border-red-500" : "border-indigo-200"
          }`}
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          aria-label={`${isVisible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 transition-colors hover:text-indigo-500"
        >
          <ToggleIcon
            className="h-5 w-5 md:h-8 md:w-8"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      </div>
      {error && (
        <p
          id={`${name}-error`}
          className="pl-3 font-sans text-[12px] text-red-500 md:text-[16px]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

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
    // noValidate: the schema is the only arbiter, so a browser bubble can
    // never pre-empt the error state the design specifies.
    <form action={action} noValidate className="flex flex-col gap-14 md:gap-24">
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
