"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { resendVerificationAction } from "@/features/auth/actions";
import type { ApiResponse } from "@gireapp/shared";

const initialState: ApiResponse = { success: false };

/** Mirrors the backend's per-account resend cooldown so the button can't
 *  promise a second email the server will quietly decline to send. */
const RESEND_COOLDOWN_SECONDS = 60;

export function ResendVerificationPanel({ email }: { email: string }) {
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    initialState,
  );
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!state.success) return undefined;
    setSecondsRemaining(RESEND_COOLDOWN_SECONDS);
  }, [state]);

  useEffect(() => {
    if (secondsRemaining <= 0) return undefined;

    const timer = setTimeout(
      () => setSecondsRemaining((remaining) => remaining - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  const isCoolingDown = secondsRemaining > 0;

  return (
    <form action={formAction} className="flex flex-col items-center gap-3">
      <input type="hidden" name="email" value={email} />

      {state.success && (
        <p
          className="text-[12px] lg:text-[14px] font-sans text-indigo-950 text-center"
          role="status"
        >
          Sent. If you still don&apos;t see it, check your spam folder.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || isCoolingDown}
        className="inline-flex items-center justify-center gap-2 h-[54px] w-full px-6 bg-white border border-indigo-200 text-indigo-800 rounded-lg text-[16px] lg:text-[18px] font-heading font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending && (
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        )}
        {isPending
          ? "Sending..."
          : isCoolingDown
            ? `Resend in ${secondsRemaining}s`
            : "Resend verification email"}
      </button>
    </form>
  );
}
