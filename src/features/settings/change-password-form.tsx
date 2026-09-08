"use client";

import { useActionState, useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import type { ApiResponse } from "@gireapp/shared";
import {
  changePasswordAction,
  endChangedPasswordSession,
} from "@/features/settings/actions";
import {
  SettingsFormLayout,
  SettingsPasswordField,
  SettingsStatusPanel,
} from "@/features/settings/settings-form";

const initialState: ApiResponse = { success: false };

/** Long enough to read the confirmation, short enough not to feel stuck. */
const SIGN_OUT_DELAY_MS = 2500;

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

  const isLocked = isPending || Boolean(state.success);

  const panel = state.success ? (
    <SettingsStatusPanel
      variant="success"
      message="Password updated successfully!"
      detail="Signing you out — please log in again with your new password."
    />
  ) : errorMessage ? (
    <SettingsStatusPanel variant="error" message={errorMessage} />
  ) : (
    <RequirementsPanel password={values.password} />
  );

  return (
    <SettingsFormLayout
      action={formAction}
      panel={panel}
      isPending={isPending}
      isDisabled={isLocked}
    >
      <SettingsPasswordField
        name="currentPassword"
        label="Current Password"
        placeholder="Enter current password"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={setField("currentPassword")}
        isInvalid={Boolean(state.errors?.currentPassword)}
        isDisabled={isLocked}
      />
      <SettingsPasswordField
        name="password"
        label="New Password"
        placeholder="Enter new password"
        autoComplete="new-password"
        value={values.password}
        onChange={setField("password")}
        isInvalid={Boolean(state.errors?.password)}
        isDisabled={isLocked}
      />
      <SettingsPasswordField
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm new password"
        autoComplete="new-password"
        value={values.confirmPassword}
        onChange={setField("confirmPassword")}
        isInvalid={Boolean(state.errors?.confirmPassword)}
        isDisabled={isLocked}
      />
    </SettingsFormLayout>
  );
}
