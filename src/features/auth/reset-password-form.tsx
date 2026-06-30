'use client';

import { useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { resetPasswordAction } from '@/features/auth/actions';
import type { ApiResponse } from '@gireapp/shared';
import { toast } from 'sonner';
import Link from 'next/link';

const initialState: ApiResponse = { success: false };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (state.success) {
      toast.success('Password reset successfully!');
      timer = setTimeout(() => router.push('/login'), 2000);
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
      <div className="text-center space-y-4">
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          Invalid or missing reset token.
        </p>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      {state.success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg" role="alert">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Password reset successfully! Redirecting to login...
          </p>
        </div>
      )}

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="reset-password" className="text-sm font-medium text-foreground">
          New Password
        </label>
        <div className="relative">
          <input
            id="reset-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            className="w-full px-4 py-3 pr-12 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            aria-describedby={state.errors?.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {state.errors?.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="reset-confirm" className="text-sm font-medium text-foreground">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="reset-confirm"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            className="w-full px-4 py-3 pr-12 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            aria-describedby={state.errors?.confirmPassword ? 'confirm-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {state.errors?.confirmPassword && (
          <p id="confirm-error" className="text-sm text-destructive" role="alert">
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
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  );
}
