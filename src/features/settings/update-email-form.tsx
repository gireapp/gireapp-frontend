"use client";

import { useActionState, useState } from "react";
import type { ApiResponse } from "@gireapp/shared";
import { updateEmailAction } from "@/features/settings/actions";
import {
  SETTINGS_FIELD_CLASSNAME,
  SETTINGS_LABEL_CLASSNAME,
  SettingsFormLayout,
  SettingsPasswordField,
  SettingsStatusPanel,
} from "@/features/settings/settings-form";

const initialState: ApiResponse = { success: false };

/** Reported in the order the fields are read, so the message matches the border. */
const FIELD_ORDER = ["newEmail", "confirmEmail", "currentPassword"] as const;

type FieldName = (typeof FIELD_ORDER)[number];

function firstFieldError(errors?: Record<string, string[]>): string | null {
  if (!errors) return null;
  for (const field of FIELD_ORDER) {
    const message = errors[field]?.[0];
    if (message) return message;
  }
  return null;
}

/** The address in use today — shown for reference, never editable. */
function CurrentEmail({ email }: { email: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className={SETTINGS_LABEL_CLASSNAME}>Current Email</p>
      <p className="flex h-[54px] w-full items-center truncate rounded-[10px] bg-indigo-100 px-3 font-sans text-[12px] text-indigo-950 md:h-16 md:text-[16px]">
        {email}
      </p>
    </div>
  );
}

function EmailField({
  name,
  label,
  placeholder,
  value,
  onChange,
  error,
  isDisabled,
}: {
  name: FieldName;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isDisabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={name} className={SETTINGS_LABEL_CLASSNAME}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isDisabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${SETTINGS_FIELD_CLASSNAME} bg-transparent ${
          error ? "border-red-500" : "border-indigo-200"
        }`}
      />
      {/* Figma repeats the reason under the offending field, not only in the
          side panel, so the fix is visible without looking away. */}
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

export function UpdateEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, isPending] = useActionState(
    updateEmailAction,
    initialState,
  );
  const [values, setValues] = useState({
    newEmail: "",
    confirmEmail: "",
    currentPassword: "",
  });

  const errorMessage = state.success
    ? null
    : (firstFieldError(state.errors) ?? state.error ?? null);

  const setField = (name: FieldName) => (value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const isLocked = isPending || Boolean(state.success);

  const panel = state.success ? (
    <SettingsStatusPanel
      variant="success"
      message={
        "Verification email sent successfully!\nPlease check your inbox."
      }
      detail={`Nothing changes until you open the link sent to ${values.newEmail}.`}
    />
  ) : errorMessage ? (
    <SettingsStatusPanel variant="error" message={errorMessage} />
  ) : (
    <SettingsStatusPanel
      variant="info"
      message="We’ll send a verification link to your new email address."
      detail="Your password confirms it’s really you making the change."
    />
  );

  return (
    <SettingsFormLayout
      action={formAction}
      panel={panel}
      isPending={isPending}
      isDisabled={isLocked}
    >
      <CurrentEmail email={currentEmail} />
      <EmailField
        name="newEmail"
        label="New Email"
        placeholder="Enter new email address"
        value={values.newEmail}
        onChange={setField("newEmail")}
        error={state.errors?.newEmail?.[0]}
        isDisabled={isLocked}
      />
      <EmailField
        name="confirmEmail"
        label="Confirm Email"
        placeholder="Confirm new email address"
        value={values.confirmEmail}
        onChange={setField("confirmEmail")}
        error={state.errors?.confirmEmail?.[0]}
        isDisabled={isLocked}
      />
      {/* Not in the Figma frames. A live session alone would otherwise be enough
          to move the account to an inbox its owner cannot reach. */}
      <SettingsPasswordField
        name="currentPassword"
        label="Current Password"
        placeholder="Enter your current password"
        autoComplete="current-password"
        value={values.currentPassword}
        onChange={setField("currentPassword")}
        error={state.errors?.currentPassword?.[0]}
        isDisabled={isLocked}
      />
    </SettingsFormLayout>
  );
}
