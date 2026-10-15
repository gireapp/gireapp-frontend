"use client";

import { useActionState, useState } from "react";
import type { ApiResponse } from "@gireapp/shared";
import { contactSupportAction } from "@/features/settings/actions";
import {
  SETTINGS_LABEL_CLASSNAME,
  SettingsFormLayout,
  SettingsStatusPanel,
  SettingsTextArea,
  SettingsTextField,
} from "@/features/settings/settings-form";

const initialState: ApiResponse = { success: false };

/** The three levels `contactFormSchema` accepts, in the order they escalate. */
const URGENCY_OPTIONS = [
  { value: "low", label: "Low", hint: "No rush" },
  { value: "medium", label: "Medium", hint: "Slowing me down" },
  { value: "high", label: "High", hint: "I am blocked" },
];

/** Reported in the order the fields are read, so the message matches the border. */
const FIELD_ORDER = ["subject", "urgency", "message"] as const;

function firstFieldError(errors?: Record<string, string[]>): string | null {
  if (!errors) return null;
  for (const field of FIELD_ORDER) {
    const message = errors[field]?.[0];
    if (message) return message;
  }
  return null;
}

export function ContactSupportForm({ replyTo }: { replyTo: string }) {
  const [state, formAction, isPending] = useActionState(
    contactSupportAction,
    initialState,
  );
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [urgency, setUrgency] = useState("medium");

  const errorMessage = state.success
    ? null
    : (firstFieldError(state.errors) ?? state.error ?? null);

  const isSent = Boolean(state.success);

  const panel = isSent ? (
    <SettingsStatusPanel
      variant="success"
      message={"Message sent successfully!\nOur team will reply by email."}
      detail={`We will write back to ${replyTo}.`}
    />
  ) : errorMessage ? (
    <SettingsStatusPanel variant="error" message={errorMessage} />
  ) : (
    <SettingsStatusPanel
      variant="info"
      message="Tell us what happened and what you expected instead. The more detail, the faster we can help."
      detail={`We reply to ${replyTo}.`}
    />
  );

  return (
    <SettingsFormLayout
      action={formAction}
      panel={panel}
      isPending={isPending}
      isDisabled={isPending || isSent}
      submitLabel="Send message"
      pendingLabel="Sending..."
    >
      <SettingsTextField
        name="subject"
        label="Subject"
        placeholder="Briefly, what is this about?"
        value={subject}
        onChange={setSubject}
        error={state.errors?.subject?.[0]}
        isDisabled={isPending || isSent}
      />

      <fieldset className="flex flex-col gap-4">
        <legend className={SETTINGS_LABEL_CLASSNAME}>Urgency</legend>
        <input type="hidden" name="urgency" value={urgency} />
        <div className="flex flex-wrap gap-3">
          {URGENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setUrgency(option.value)}
              aria-pressed={urgency === option.value}
              disabled={isPending || isSent}
              className={`flex flex-col items-start rounded-[10px] border px-4 py-2 text-left transition-colors disabled:opacity-60 ${
                urgency === option.value
                  ? "border-indigo-800 bg-indigo-100"
                  : "border-indigo-200 hover:bg-indigo-100"
              }`}
            >
              <span className="font-sans text-[12px] text-indigo-950 md:text-[16px]">
                {option.label}
              </span>
              <span className="font-sans text-[10px] text-indigo-400 md:text-[12px]">
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <SettingsTextArea
        name="message"
        label="Message"
        placeholder="What happened, and what did you expect instead?"
        value={message}
        onChange={setMessage}
        error={state.errors?.message?.[0]}
        isDisabled={isPending || isSent}
      />
    </SettingsFormLayout>
  );
}
