'use client';

import { useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { loginAction } from '@/features/auth/actions';
import type { ApiResponse } from '@gireapp/shared';
import { toast } from 'sonner';
import { z } from 'zod';

const initialState: ApiResponse = { success: false };

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordSchema = z.string().min(1, 'Password is required');

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Safely parse callbackUrl to prevent open redirects
  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl = (rawCallbackUrl && rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//')) 
    ? rawCallbackUrl 
    : '/dashboard';

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState({ email: '', password: '' });

  const validateField = useCallback((field: string, value: string) => {
    let error: string | undefined;
    if (field === 'email') {
      const result = emailSchema.safeParse(value);
      if (!result.success) error = result.error.errors[0]?.message;
    } else if (field === 'password') {
      const result = passwordSchema.safeParse(value);
      if (!result.success) error = result.error.errors[0]?.message;
    }
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  }, []);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, values[field as keyof typeof values]);
  }, [validateField, values]);

  const handleChange = useCallback((field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  }, [touched, validateField]);

  const getError = (field: keyof FieldErrors): string | undefined => {
    if (state.errors?.[field]) return state.errors[field][0];
    if (touched[field]) return fieldErrors[field];
    return undefined;
  };

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.info('Session expired. Please log in again.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (state.success) {
      toast.success('Welcome back!');
      router.push(callbackUrl);
      router.refresh();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, callbackUrl]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="text-[20px] font-heading font-bold text-indigo-950 break-words">
          Email Address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className={`w-full h-[54px] px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${
            getError('email') || state.error ? 'border-destructive' : ''
          }`}
          aria-describedby={getError('email') ? 'email-error' : undefined}
          aria-invalid={getError('email') || !!state.error ? 'true' : undefined}
        />
        {getError('email') && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {getError('email')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-[20px] font-heading font-bold text-indigo-950 break-words">
            Password
          </label>
          <Link href="/forgot-password" className="text-[14px] font-sans text-coral-500 font-normal hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`w-full h-[54px] px-4 pr-12 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${
              getError('password') || state.error ? 'border-destructive' : ''
            }`}
            aria-describedby={getError('password') ? 'password-error' : undefined}
            aria-invalid={getError('password') || !!state.error ? 'true' : undefined}
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

      {state.error && (
        <p className="text-sm text-destructive text-center" role="alert">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        id="login-submit"
        className="w-full flex items-center justify-center gap-2 h-[56px] mt-8 bg-coral-500 text-indigo-50 rounded-lg text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Logging in...
          </>
        ) : (
          'Log In'
        )}
      </button>

      <p className="text-center text-[14px] font-sans text-indigo-800 mt-3">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-coral-500 font-normal hover:underline ml-1">
          Sign up
        </Link>
      </p>
    </form>
  );
}
