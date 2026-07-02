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
import { Loader2, CheckCircle } from 'lucide-react';
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

  // Calculate how many steps are completed (0 to 3) based on filled inputs
  const filledCount = [values.name, values.email, values.password, values.confirmPassword].filter(v => v.trim().length > 0).length;
  const currentStep = Math.min(filledCount, 3);

  return (
    <form action={formAction} className="space-y-5">
      {/* Mobile Progress Bar (hidden on desktop) */}
      <div className="lg:hidden w-full flex justify-center items-center pt-2 pb-6 relative">
        <div className="relative flex items-center justify-between w-[102px]">
          {/* Inactive line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-full bg-indigo-200 rounded-full" />
          {/* Active animated line */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-400 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
          {/* Dots */}
          {[0, 1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`w-2 h-2 rounded-full relative z-10 transition-colors duration-300 ease-in-out ${
                step <= currentStep ? 'bg-indigo-800' : 'bg-indigo-200'
              }`}
            />
          ))}
        </div>
      </div>
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
      <div className="flex flex-col gap-2">
        <label htmlFor="register-name" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">
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
          className={`w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${
            getError('name') ? 'border-destructive' : ''
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
      <div className="flex flex-col gap-2">
        <label htmlFor="register-email" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">
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
          className={`w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${
            getError('email') ? 'border-destructive' : ''
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
      <div className="flex flex-col gap-2">
        <label htmlFor="register-password" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">
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
            className={`w-full h-[54px] px-3 lg:px-4 pr-12 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${
              getError('password') ? 'border-destructive' : ''
            }`}
            aria-describedby={getError('password') ? 'password-error' : undefined}
            aria-invalid={getError('password') ? 'true' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-500 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
              {showPassword && <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
        {getError('password') && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {getError('password')}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="register-confirm" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">
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
            className={`w-full h-[54px] px-3 lg:px-4 pr-12 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${
              getError('confirmPassword') ? 'border-destructive' : ''
            }`}
            aria-describedby={getError('confirmPassword') ? 'confirm-error' : undefined}
            aria-invalid={getError('confirmPassword') ? 'true' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-500 transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
              {showConfirm && <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
            </svg>
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
        className="w-full flex items-center justify-center gap-2 h-[54px] lg:h-[56px] mt-8 bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Creating account...
          </>
        ) : (
          'Continue'
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-[12px] lg:text-[14px] font-sans text-indigo-800 mt-3">
        Already have an account?{' '}
        <Link href="/login" className="text-coral-500 font-normal hover:underline ml-1">
          Log in
        </Link>
      </p>

    </form>
  );
}
