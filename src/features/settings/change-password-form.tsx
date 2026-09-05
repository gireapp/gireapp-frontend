"use client";

import { useActionState, useEffect, useState } from "react";
import { CircleCheck, CircleX, Eye, EyeOff, Loader2 } from "lucide-react";
import type { ApiResponse } from "@gireapp/shared";
import {
  changePasswordAction,
  endChangedPasswordSession,
} from "@/features/settings/actions";

const initialState: ApiResponse = { success: false };

/** Long enough to read the confirmation, short enough not to feel stuck. */
const SIGN_OUT_DELAY_MS = 2500;

/** The one element that carries the outcome, referenced by any invalid field. */
const STATUS_ELEMENT_ID = "change-password-status";

/**
 * A readable mirror of the rules in `changePasswordSchema` — the schema stays
 * the thing that decides, this only tells the learner where they are. Figma
 * lists "at least one symbol", which nothing in the system actually enforces;
 * these three are the rules that do apply.
 */
const PASSWORD_RULES = [
  {
    label: "At least 8 characters",
    isMet: (value: string) => value.length >= 8,
  },
  { label: "At least one number", isMet: (value: string) => /\d/.test(value) },
  {
    label: "Upper and lowercase letters",
    isMet: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
];

/** Reported in the order the fields are read, so the message matches the border. */
const FIELD_ORDER = ["currentPassword", "password", "confirmPassword"] as const;

type FieldName = (typeof FIELD_ORDER)[number];

function firstFieldError(errors?: Record<string, string[]>): string | null {
  if (!errors) return null;
  for (const field of FIELD_ORDER) {
    const message = errors[field]?.[0];
    if (message) return message;
  }
  return null;
}

const FIELD_CLASSNAME =
  "h-[54px] w-full rounded-[10px] border bg-transparent px-3 pr-11 font-sans text-[12px] text-indigo-950 placeholder:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 md:h-16 md:pr-14 md:text-[16px]";

function PasswordField({
  name,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
  isInvalid,
  isDisabled,
}: {
  name: FieldName;
  label: string;
  placeholder: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  isInvalid: boolean;
  isDisabled: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ToggleIcon = isVisible ? Eye : EyeOff;

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor={name}
        className="pl-3 font-heading text-[16px] font-bold text-indigo-950 md:text-[20px]"
      >
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
          aria-invalid={isInvalid ? "true" : undefined}
          aria-describedby={isInvalid ? STATUS_ELEMENT_ID : undefined}
          className={`${FIELD_CLASSNAME} ${
            isInvalid ? "border-red-500" : "border-indigo-200"
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
    </div>
  );
}

function RequirementsPanel({ password }: { password: string }) {
  return (
    <div className="rounded-[10px] bg-indigo-50 p-3 md:px-6 md:py-8">
      <p className="font-sans text-[12px] text-indigo-950 md:text-[16px]">
        Password must contain:
      </p>
      <ul className="mt-2 flex flex-col gap-2 md:mt-4 md:gap-4">
        {PASSWORD_RULES.map((rule) => (
          <li key={rule.label} className="flex items-center gap-1">
            <CircleCheck
              className={`h-4 w-4 shrink-0 md:h-8 md:w-8 ${
                rule.isMet(password) ? "text-green-500" : "text-indigo-300"
              }`}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="font-sans text-[12px] text-indigo-950 md:text-[16px]">
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Figma draws the outcome where the rules were: a single line on mobile, a
 * bordered card with a large mark on desktop.
 */
function StatusPanel({
  isSuccess,
  message,
  detail,
}: {
  isSuccess: boolean;
  message: string;
  detail?: string;
}) {
  const Icon = isSuccess ? CircleCheck : CircleX;
  // Written out rather than interpolated — Tailwind only sees whole class names.
  const accent = isSuccess
    ? {
        border: "md:border-green-500",
        mark: "fill-green-500",
        text: "text-green-500",
      }
    : {
        border: "md:border-red-500",
        mark: "fill-red-500",
        text: "text-red-500",
      };

  return (
    <div
      id={STATUS_ELEMENT_ID}
      role={isSuccess ? "status" : "alert"}
      className={`flex items-center gap-4 rounded-[10px] bg-indigo-50 p-3 md:flex-col md:justify-center md:gap-6 md:border md:px-6 md:py-12 ${accent.border}`}
    >
      <Icon
        className={`h-6 w-6 shrink-0 text-indigo-50 md:h-[120px] md:w-[120px] ${accent.mark}`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="md:text-center">
        <p className={`font-sans text-[12px] md:text-[16px] ${accent.text}`}>
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

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );
  const [values, setValues] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  // The password change already killed this session on the backend; leaving the
  // cookie behind would only produce a dashboard that 401s on every request.
  useEffect(() => {
    if (!state.success) return;
    const timer = setTimeout(() => {
      void endChangedPasswordSession();
    }, SIGN_OUT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.success]);

  const errorMessage = state.success
    ? null
    : (firstFieldError(state.errors) ?? state.error ?? null);

  const setField = (name: FieldName) => (value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const isLocked = isPending || state.success;

  return (
    <form action={formAction} className="flex flex-col gap-14 md:gap-24">
      {/* Figma hangs the side panel lower than the fields; centring it against
          the column lands in the same place without pinning a magic offset. */}
      <div className="flex flex-col gap-[30px] md:flex-row md:items-center md:justify-between md:gap-16">
        <div className="flex flex-col gap-[14px] md:w-[467px] md:gap-6">
          <PasswordField
            name="currentPassword"
            label="Current Password"
            placeholder="Enter current password"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={setField("currentPassword")}
            isInvalid={Boolean(state.errors?.currentPassword)}
            isDisabled={isLocked}
          />
          <PasswordField
            name="password"
            label="New Password"
            placeholder="Enter new password"
            autoComplete="new-password"
            value={values.password}
            onChange={setField("password")}
            isInvalid={Boolean(state.errors?.password)}
            isDisabled={isLocked}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={setField("confirmPassword")}
            isInvalid={Boolean(state.errors?.confirmPassword)}
            isDisabled={isLocked}
          />
        </div>

        <div className="md:w-[320px]">
          {state.success ? (
            <StatusPanel
              isSuccess
              message="Password updated successfully!"
              detail="Signing you out — please log in again with your new password."
            />
          ) : errorMessage ? (
            <StatusPanel isSuccess={false} message={errorMessage} />
          ) : (
            <RequirementsPanel password={values.password} />
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLocked}
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
