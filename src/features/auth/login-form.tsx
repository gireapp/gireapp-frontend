'use client';

import { useActionState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-foreground">
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
          className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow ${
            getError('email') || state.error ? 'border-destructive' : 'border-input'
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
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
            className={`w-full px-4 py-3 pr-12 bg-background border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow ${
              getError('password') || state.error ? 'border-destructive' : 'border-input'
            }`}
            aria-describedby={getError('password') ? 'password-error' : undefined}
            aria-invalid={getError('password') || !!state.error ? 'true' : undefined}
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

      {state.error && (
        <p className="text-sm text-destructive text-center" role="alert">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        id="login-submit"
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Logging in...
          </>
        ) : (
          'Log In'
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
