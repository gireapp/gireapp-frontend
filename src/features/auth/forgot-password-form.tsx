"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { forgotPasswordAction } from "@/features/auth/actions";
import type { ApiResponse } from "@gireapp/shared";

const initialState: ApiResponse = { success: false };

function SuccessCheck() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8.333" fill="#22C55E" />
      <path
        d="M6.667 10.417L8.75 12.5l4.583-4.583"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.success && (
        <div
          className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
          role="alert"
        >
          <SuccessCheck />
          <p className="text-[12px] lg:text-[14px] font-sans text-indigo-950">
            If an account exists with that email, a reset link has been sent.
            Check your inbox.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label
          htmlFor="forgot-email"
          className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words"
        >
          Email Address
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
          aria-describedby={
            state.errors?.email ? "forgot-email-error" : undefined
          }
          aria-invalid={state.errors?.email ? "true" : undefined}
        />
        {state.errors?.email && (
          <p
            id="forgot-email-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 h-[54px] lg:h-[56px] mt-8 bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Sending...
          </>
        ) : (
          "Send reset link"
        )}
      </button>

      <p className="text-center text-[12px] lg:text-[14px] font-sans text-indigo-800 mt-3">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="text-coral-500 font-normal hover:underline ml-1"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
