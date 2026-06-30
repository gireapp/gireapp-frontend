// ─────────────────────────────────────────────────
// GIREAPP — Register Form (Client Component)
// React Hook Form + Zod client-side validation + Server Action
// Inline validation on blur BEFORE submission (AC-2)
// ─────────────────────────────────────────────────

'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { registerAction } from '@/features/auth/actions';
import type { ApiResponse } from '@gireapp/shared';
import { toast } from 'sonner';
import { z } from 'zod';

const initialState: ApiResponse = { success: false };

// ── Client-side validation schemas (mirrors server Zod schema) ──

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be under 100 characters');

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be under 255 characters');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be under 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Must contain at least one uppercase letter, one lowercase letter, and one number'
  );

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  // ── Client-side inline validation state ──
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Validate a single field on blur
  const validateField = useCallback((field: string, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'name': {
        const result = nameSchema.safeParse(value);
        if (!result.success) error = result.error.errors[0]?.message;
        break;
      }
      case 'email': {
        const result = emailSchema.safeParse(value);
        if (!result.success) error = result.error.errors[0]?.message;
        break;
      }
      case 'password': {
        const result = passwordSchema.safeParse(value);
        if (!result.success) error = result.error.errors[0]?.message;
        // Also re-validate confirmPassword if it's been touched
        if (touched.confirmPassword && values.confirmPassword) {
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: values.confirmPassword !== value ? 'Passwords do not match' : undefined,
          }));
        }
        break;
      }
      case 'confirmPassword': {
        if (value !== values.password) {
          error = 'Passwords do not match';
        }
        break;
      }
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  }, [touched.confirmPassword, values.confirmPassword, values.password]);

  // Handle field blur — mark as touched and validate
  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, values[field as keyof typeof values]);
  }, [validateField, values]);

  // Handle field change — update value and clear error if field was touched
  const handleChange = useCallback((field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Re-validate on change only if the field has been touched (blurred once)
    if (touched[field]) {
      validateField(field, value);
    }
  }, [touched, validateField]);

  // Merge client-side and server-side errors (server errors take priority after submit)
  const getError = (field: keyof FieldErrors): string | undefined => {
    // After a server response, show server errors
    if (state.errors?.[field]) return state.errors[field][0];
    // Before submission or if server didn't flag this field, show client errors
    if (touched[field]) return fieldErrors[field];
    return undefined;
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (state.success) {
      toast.success('Account created! Redirecting to login...', {
        duration: 5000,
      });
      // Redirect to login after a brief delay
      timer = setTimeout(() => router.push('/login'), 2000);
    }
    if (state.error) {
      toast.error(state.error);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      {/* Success state */}
      {state.success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg" role="alert">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Account created! Please check your email to verify your account.
          </p>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="register-name" className="text-sm font-medium text-foreground">
          Full Name
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="e.g. Tobi Ojo"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow ${
            getError('name') ? 'border-destructive' : 'border-input'
          }`}
          aria-describedby={getError('name') ? 'name-error' : undefined}
          aria-invalid={getError('name') ? 'true' : undefined}
        />
        {getError('name') && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {getError('name')}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="register-email" className="text-sm font-medium text-foreground">
          Email Address
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow ${
            getError('email') ? 'border-destructive' : 'border-input'
          }`}
          aria-describedby={getError('email') ? 'email-error' : undefined}
          aria-invalid={getError('email') ? 'true' : undefined}
        />
        {getError('email') && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {getError('email')}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="register-password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <input
            id="register-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`w-full px-4 py-3 pr-12 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow ${
              getError('password') ? 'border-destructive' : 'border-input'
            }`}
            aria-describedby={getError('password') ? 'password-error' : undefined}
            aria-invalid={getError('password') ? 'true' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
        {getError('password') && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {getError('password')}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="register-confirm" className="text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="register-confirm"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            className={`w-full px-4 py-3 pr-12 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow ${
              getError('confirmPassword') ? 'border-destructive' : 'border-input'
            }`}
            aria-describedby={getError('confirmPassword') ? 'confirm-error' : undefined}
            aria-invalid={getError('confirmPassword') ? 'true' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
        {getError('confirmPassword') && (
          <p id="confirm-error" className="text-sm text-destructive" role="alert">
            {getError('confirmPassword')}
          </p>
        )}
      </div>

      {/* Global error */}
      {state.error && !state.success && (
        <p className="text-sm text-destructive text-center" role="alert">
          {state.error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || state.success}
        id="register-submit"
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
