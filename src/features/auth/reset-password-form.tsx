"use client";

import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/features/auth/actions";
import type { ApiResponse } from "@gireapp/shared";
import { toast } from "sonner";
import Link from "next/link";

const initialState: ApiResponse = { success: false };

const REDIRECT_TO_LOGIN_DELAY_MS = 2000;

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      className="w-6 h-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {crossed && (
        <path
          d="M3 3L21 21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

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

const inputClassName =
  "w-full h-[54px] px-3 lg:px-4 pr-12 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow";

const labelClassName =
  "text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words";

const toggleClassName =
  "absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-500 transition-colors";

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (state.success) {
      toast.success("Password reset successfully!");
      timer = setTimeout(
        () => router.push("/login"),
        REDIRECT_TO_LOGIN_DELAY_MS,
      );
    }
    if (state.error) {
      toast.error(state.error);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, router]);

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="w-full text-[12px] lg:text-[14px] font-sans text-destructive bg-destructive/10 p-4 rounded-lg">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-[12px] lg:text-[14px] font-sans text-coral-500 font-normal hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      {state.success && (
        <div
          className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
          role="alert"
        >
          <SuccessCheck />
          <p className="text-[12px] lg:text-[14px] font-sans text-indigo-950">
            Password reset successfully! Redirecting to log in...
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="reset-password" className={labelClassName}>
          New Password
        </label>
        <div className="relative">
          <input
            id="reset-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            className={inputClassName}
            aria-describedby={
              state.errors?.password ? "reset-password-error" : undefined
            }
            aria-invalid={state.errors?.password ? "true" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={toggleClassName}
            aria-label={
              showPassword ? "Hide new password" : "Show new password"
            }
          >
            <EyeIcon crossed={showPassword} />
          </button>
        </div>
        {state.errors?.password && (
          <p
            id="reset-password-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reset-confirm" className={labelClassName}>
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="reset-confirm"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            className={inputClassName}
            aria-describedby={
              state.errors?.confirmPassword ? "reset-confirm-error" : undefined
            }
            aria-invalid={state.errors?.confirmPassword ? "true" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className={toggleClassName}
            aria-label={
              showConfirm ? "Hide confirm password" : "Show confirm password"
            }
          >
            <EyeIcon crossed={showConfirm} />
          </button>
        </div>
        {state.errors?.confirmPassword && (
          <p
            id="reset-confirm-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {state.errors.confirmPassword[0]}
          </p>
        )}
      </div>

      {state.error && !state.success && (
        <p className="text-sm text-destructive text-center" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || state.success}
        className="w-full flex items-center justify-center gap-2 h-[54px] lg:h-[56px] mt-8 bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Resetting...
          </>
        ) : (
          "Reset password"
        )}
      </button>
    </form>
  );
}
