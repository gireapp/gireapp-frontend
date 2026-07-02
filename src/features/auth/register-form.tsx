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

// ── Client-side validation schemas ──
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters');
const emailSchema = z.string().min(1, 'Email is required').email('Please enter a valid email address').max(255, 'Email must be under 255 characters');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be under 128 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain at least one uppercase letter, one lowercase letter, and one number');

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword', string>>;

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const router = useRouter();

  // Multi-step state
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [values, setValues] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    track: '', department: '', courses: '', focusArea: ''
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate step 1 fields
  const validateField = useCallback((field: string, value: string) => {
    let error: string | undefined;
    switch (field) {
      case 'name':
        if (!nameSchema.safeParse(value).success) error = nameSchema.safeParse(value).error?.errors[0]?.message;
        break;
      case 'email':
        if (!emailSchema.safeParse(value).success) error = emailSchema.safeParse(value).error?.errors[0]?.message;
        break;
      case 'password':
        if (!passwordSchema.safeParse(value).success) error = passwordSchema.safeParse(value).error?.errors[0]?.message;
        if (touched.confirmPassword && values.confirmPassword) {
          setFieldErrors(prev => ({ ...prev, confirmPassword: values.confirmPassword !== value ? 'Passwords do not match' : undefined }));
        }
        break;
      case 'confirmPassword':
        if (value !== values.password) error = 'Passwords do not match';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [touched.confirmPassword, values.confirmPassword, values.password]);

  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, values[field as keyof typeof values]);
  }, [validateField, values]);

  const handleChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const getError = (field: keyof FieldErrors) => {
    if (state.errors?.[field]) return state.errors[field][0];
    if (touched[field]) return fieldErrors[field];
    return undefined;
  };

  const handleNextStep1 = () => {
    // Touch all fields to show errors if empty
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const nValid = validateField('name', values.name);
    const eValid = validateField('email', values.email);
    const pValid = validateField('password', values.password);
    const cpValid = validateField('confirmPassword', values.confirmPassword);
    
    if (nValid && eValid && pValid && cpValid && values.name && values.email && values.password && values.confirmPassword) {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    if (values.track) setStep(3);
    else toast.error('Please select a track to continue.');
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (state.success) {
      setStep(4);
      toast.success('Account created! Redirecting to login...', { duration: 5000 });
      timer = setTimeout(() => router.push('/login'), 3000);
    }
    if (state.error) {
      toast.error(state.error);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [state, router]);

  const renderBackArrow = () => (
    <svg className="w-full h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9.1665 20.0034H31.6665" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.3334 30.0033C18.3334 30.0033 8.33351 22.6383 8.3335 20.0031C8.33348 17.3679 18.3335 10.0032 18.3335 10.0032" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="flex w-full flex-col">
      {/* Mobile Progress Bar (hidden on desktop) */}
      <div className="lg:hidden w-full flex justify-center items-center py-2 mb-6 relative">
        <div className="relative flex items-center justify-between w-[102px]">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-full bg-indigo-200 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-400 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s}
              className={`w-2 h-2 rounded-full relative z-10 transition-colors duration-300 ease-in-out ${
                s <= step ? 'bg-indigo-800' : 'bg-indigo-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Header */}
      <div className="inline-flex w-full max-w-[466px] flex-col items-start gap-2 mb-8">
        <div className="inline-flex items-center justify-start gap-3">
          {step > 1 && step < 4 ? (
            <button 
              type="button"
              onClick={() => setStep(step - 1)}
              className="relative h-6 w-6 lg:h-10 lg:w-10 shrink-0 hover:bg-indigo-50/50 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Go back"
            >
              {renderBackArrow()}
            </button>
          ) : (
            <Link 
              href="/" 
              className="relative h-6 w-6 lg:h-10 lg:w-10 shrink-0 hover:bg-indigo-50/50 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Go back to landing page"
            >
              {renderBackArrow()}
            </Link>
          )}
          <h1 className="flex flex-col justify-center text-[20px] lg:text-[28px] font-bold text-indigo-950 font-heading break-words">
            {step === 1 && 'Create your account'}
            {step === 2 && 'Select your track'}
            {step === 3 && 'Customize your path'}
            {step === 4 && 'Account Created!'}
          </h1>
        </div>
        <p className="flex flex-col justify-center self-stretch text-[14px] lg:text-[16px] font-normal text-indigo-950 break-words">
          {step === 1 && 'Let’s get you started on your learning journey'}
          {step === 2 && 'Choose the educational path that fits your goals'}
          {step === 3 && 'Tell us more so we can personalize your experience'}
          {step === 4 && 'You are all set to begin your journey.'}
        </p>
      </div>

      {/* Form Content */}
      <form action={formAction} className="w-full relative">
        {/* Hidden inputs to pass data collected across steps to the final Server Action */}
        <input type="hidden" name="name" value={values.name} />
        <input type="hidden" name="email" value={values.email} />
        <input type="hidden" name="password" value={values.password} />
        <input type="hidden" name="confirmPassword" value={values.confirmPassword} />
        <input type="hidden" name="track" value={values.track} />
        <input type="hidden" name="department" value={values.department} />
        <input type="hidden" name="courses" value={values.courses} />
        <input type="hidden" name="focusArea" value={values.focusArea} />

        {/* Global error */}
        {state.error && !state.success && (
          <p className="text-sm text-destructive text-center mb-4" role="alert">
            {state.error}
          </p>
        )}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-2">
              <label htmlFor="register-name" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Full Name</label>
              <input id="register-name" type="text" placeholder="e.g. Tobi Ojo" value={values.name} onChange={(e) => handleChange('name', e.target.value)} onBlur={() => handleBlur('name')} className={`w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${getError('name') ? 'border-destructive' : ''}`} />
              {getError('name') && <p className="text-sm text-destructive">{getError('name')}</p>}
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="register-email" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Email Address</label>
              <input id="register-email" type="email" placeholder="you@example.com" value={values.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')} className={`w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${getError('email') ? 'border-destructive' : ''}`} />
              {getError('email') && <p className="text-sm text-destructive">{getError('email')}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="register-password" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Password</label>
              <div className="relative">
                <input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" value={values.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')} className={`w-full h-[54px] px-3 lg:px-4 pr-12 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${getError('password') ? 'border-destructive' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-500 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    {showPassword && <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                  </svg>
                </button>
              </div>
              {getError('password') && <p className="text-sm text-destructive">{getError('password')}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="register-confirm" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Confirm Password</label>
              <div className="relative">
                <input id="register-confirm" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter your password" value={values.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} onBlur={() => handleBlur('confirmPassword')} className={`w-full h-[54px] px-3 lg:px-4 pr-12 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${getError('confirmPassword') ? 'border-destructive' : ''}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-500 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    {showConfirm && <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                  </svg>
                </button>
              </div>
              {getError('confirmPassword') && <p className="text-sm text-destructive">{getError('confirmPassword')}</p>}
            </div>

            <button type="button" onClick={handleNextStep1} className="w-full flex items-center justify-center gap-2 h-[54px] lg:h-[56px] mt-8 bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors">
              Continue
            </button>
            <p className="text-center text-[12px] lg:text-[14px] font-sans text-indigo-800 mt-3">
              Already have an account? <Link href="/login" className="text-coral-500 font-normal hover:underline ml-1">Log in</Link>
            </p>
          </div>
        )}

        {/* STEP 2: Track Selection */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-4">
              {['Tertiary', 'Secondary', 'Professional'].map((trackName) => (
                <button
                  key={trackName}
                  type="button"
                  onClick={() => handleChange('track', trackName)}
                  className={`w-full h-[64px] px-6 rounded-xl border-2 flex items-center justify-between transition-all duration-200 ${
                    values.track === trackName 
                      ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                      : 'border-indigo-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <span className="text-[16px] lg:text-[18px] font-heading font-bold text-indigo-950">{trackName} Track</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${values.track === trackName ? 'border-indigo-600' : 'border-indigo-200'}`}>
                    {values.track === trackName && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                  </div>
                </button>
              ))}
            </div>
            
            <button type="button" onClick={handleNextStep2} className="w-full flex items-center justify-center gap-2 h-[54px] lg:h-[56px] mt-8 bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors">
              Continue
            </button>
          </div>
        )}

        {/* STEP 3: Customize Path */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-2">
              <label htmlFor="register-dept" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Department / Field</label>
              <input id="register-dept" type="text" placeholder="e.g. Computer Science" value={values.department} onChange={(e) => handleChange('department', e.target.value)} className="w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="register-courses" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Target Courses</label>
              <input id="register-courses" type="text" placeholder="e.g. Mathematics, Physics" value={values.courses} onChange={(e) => handleChange('courses', e.target.value)} className="w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="register-focus" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Area of Focus</label>
              <input id="register-focus" type="text" placeholder="e.g. Software Engineering" value={values.focusArea} onChange={(e) => handleChange('focusArea', e.target.value)} className="w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal break-words focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow" />
            </div>

            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 h-[54px] lg:h-[56px] mt-8 bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Creating account...</>
              ) : 'Complete Registration'}
            </button>
          </div>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500 ease-out flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-[24px] font-heading font-bold text-indigo-950 mb-4">Registration Successful!</h2>
            <p className="text-[16px] text-indigo-800 font-sans max-w-[300px]">
              Your personalized learning journey is ready. Please check your email to verify your account.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
