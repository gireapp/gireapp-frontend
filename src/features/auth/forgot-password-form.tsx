'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPasswordAction } from '@/features/auth/actions';
import type { ApiResponse } from '@gireapp/shared';

const initialState: ApiResponse = { success: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg" role="alert">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            If an account exists with that email, a reset link has been sent. Check your inbox.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
          Email Address
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to login
      </Link>
    </form>
  );
}
