'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { registerAction } from '@/features/auth/actions';
import type { ApiResponse } from '@gireapp/shared';
import { calculateAge } from '@gireapp/shared';
import { toast } from 'sonner';
import { z } from 'zod';

const initialState: ApiResponse = { success: false };

// ── Client-side validation schemas ──
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters');
const emailSchema = z.string().min(1, 'Email is required').email('Please enter a valid email address').max(255, 'Email must be under 255 characters');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be under 128 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain at least one uppercase letter, one lowercase letter, and one number');
const dobSchema = z
  .string()
  .min(1, 'Date of birth is required')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Please enter a valid date')
  .refine((v) => new Date(v) <= new Date(), 'Date of birth cannot be in the future')
  .refine((v) => calculateAge(new Date(v)) <= 120, 'Please enter a valid date of birth');
const guardianEmailSchema = z.string().min(1, 'A guardian email is required for accounts under 18').email('Please enter a valid guardian email address');

const MAX_DOB = new Date().toISOString().split('T')[0];
const MIN_DOB = new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0];

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword' | 'dateOfBirth' | 'guardianEmail', string>>;

function SecondaryIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 4.50001C11.6907 4.49485 15.2527 5.83063 18 8.25V31.5C15.2527 29.0806 11.6907 27.7449 8 27.75C5.65698 27.75 4.48548 27.75 3.96789 27.4188C3.65715 27.2199 3.53019 27.0929 3.33129 26.7821C3 26.2646 3 25.3411 3 23.4943V9.60483C3 7.46315 3 6.39231 3.82311 5.52429C4.64622 4.65627 5.48885 4.61148 7.17408 4.5219C7.4475 4.50736 7.72287 4.50001 8 4.50001Z" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28.0001 4.50001C24.3093 4.49485 20.7473 5.83063 18 8.25V31.5C20.7473 29.0806 24.3093 27.7449 28.0001 27.75C30.3431 27.75 31.5146 27.75 32.0321 27.4188C32.3429 27.2199 32.4698 27.0929 32.6687 26.7821C33 26.2646 33 25.3411 33 23.4943V9.60483C33 7.46315 33 6.39231 32.1769 5.52429C31.3537 4.65627 30.5112 4.61148 28.826 4.5219C28.5525 4.50736 28.2771 4.50001 28.0001 4.50001Z" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TertiaryIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M33 13.5V22.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 18V22.6004C27 24.2 27 24.9997 26.6055 25.6606L26.5974 25.6739C26.1991 26.3327 25.4764 26.7357 24.0309 27.5416C21.0967 29.1777 19.6296 29.9958 18.0163 30H17.9837C16.3704 29.9958 14.9033 29.1777 11.9691 27.5416C10.5236 26.7357 9.80087 26.3327 9.4026 25.6739L9.39458 25.6606C9 24.9997 9 24.2 9 22.6004V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.7821 7.83378L6.60967 10.8111C4.20322 11.9719 3 12.5522 3 13.4869C3 14.4215 4.20322 15.0019 6.60967 16.1626L12.897 19.1953C15.3912 20.3985 16.6383 21 17.9724 21C19.3066 21 20.5538 20.3985 23.048 19.1953L29.4579 16.1034C31.8211 14.9636 33.0027 14.3936 33 13.456C32.9973 12.5183 31.8219 11.9598 29.471 10.8429C27.3269 9.8241 25.3027 8.88774 23.1495 7.86276C20.536 6.61864 19.2292 5.99658 17.9029 6.00001C16.5768 6.00343 15.3119 6.61356 12.7821 7.83378Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfessionalIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 25.5C15.4896 25.5 13.3046 27.3975 12.1765 30.1968C11.6377 31.5338 12.4108 33 13.4382 33H22.5618C23.5891 33 24.3623 31.5338 23.8235 30.1968C22.6955 27.3975 20.5104 25.5 18 25.5Z" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M27.75 7.5H29.5533C31.3547 7.5 32.2552 7.5 32.7252 8.06604C33.195 8.63208 32.9997 9.48169 32.609 11.1809L32.0227 13.7296C31.1413 17.5629 27.9164 20.4132 24 21" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.25 7.5H6.44669C4.64538 7.5 3.74474 7.5 3.27486 8.06604C2.80499 8.63208 3.00036 9.48169 3.39113 11.1809L3.97722 13.7296C4.85871 17.5629 8.08368 20.4132 12 21" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 25.5C22.5312 25.5 26.3475 18.5069 27.4946 8.98634C27.8118 6.35337 27.9705 5.0369 27.1302 4.01844C26.2901 3 24.9335 3 22.2201 3H13.7799C11.0666 3 9.71 3 8.86976 4.01844C8.02952 5.0369 8.18813 6.35337 8.50538 8.98634C9.6525 18.5069 13.4688 25.5 18 25.5Z" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}

const TRACKS = [
  { id: 'Secondary', title: 'Secondary', description: 'For secondary school students', detail: '(SS1 -SS3)', border: 'border-indigo-800', dot: 'bg-indigo-800', iconSelected: 'text-indigo-500', Icon: SecondaryIcon },
  { id: 'Tertiary', title: 'Tertiary', description: 'For tertiary institution students', detail: 'Undergraduates and Postgraduates', border: 'border-coral-500', dot: 'bg-coral-500', iconSelected: 'text-coral-500', Icon: TertiaryIcon },
  { id: 'Professional', title: 'Professional', description: 'For industry professionals', detail: 'Career Advancement Track', border: 'border-green-500', dot: 'bg-green-500', iconSelected: 'text-green-500', Icon: ProfessionalIcon },
] as const;

const CUSTOMIZE_FIELDS = [
  { id: 'department', label: 'Department', placeholder: 'Select Department', options: ['Science', 'Arts / Humanities', 'Commercial', 'Technology'] },
  { id: 'level', label: 'Class / Level', placeholder: 'Select Class/Level', options: ['SS1', 'SS2', 'SS3', '100 Level', '200 Level', '300 Level', '400 Level', 'Professional'] },
  { id: 'focusArea', label: 'Area of focus', placeholder: 'Select Focus', options: ['WAEC Prep', 'JAMB Prep', 'NECO Prep', 'Career Advancement', 'General Study'] },
] as const;

function SummaryCheck() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="8" r="6.667" fill="#C7D2FE" />
      <path d="M5.333 8.333L7 10l3.333-3.333" stroke="#3730A3" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  // Multi-step state
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [values, setValues] = useState({
    name: '', email: '', password: '', confirmPassword: '', dateOfBirth: '', guardianEmail: '',
    track: '', department: '', level: '', focusArea: ''
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Under-18 accounts get full academic access immediately; only Mentorship is gated
  // behind guardian confirmation later (see PRD §5.6). Never blocks registration itself.
  const isMinor = values.dateOfBirth ? calculateAge(new Date(values.dateOfBirth)) < 18 : false;

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
      case 'dateOfBirth':
        if (!dobSchema.safeParse(value).success) error = dobSchema.safeParse(value).error?.errors[0]?.message;
        break;
      case 'guardianEmail':
        if (values.dateOfBirth && calculateAge(new Date(values.dateOfBirth)) < 18) {
          if (!guardianEmailSchema.safeParse(value).success) {
            error = guardianEmailSchema.safeParse(value).error?.errors[0]?.message;
          }
        }
        break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  }, [touched.confirmPassword, values.confirmPassword, values.password, values.dateOfBirth]);

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
    setTouched(prev => ({ ...prev, name: true, email: true, password: true, confirmPassword: true, dateOfBirth: true, guardianEmail: true }));
    const nValid = validateField('name', values.name);
    const eValid = validateField('email', values.email);
    const pValid = validateField('password', values.password);
    const cpValid = validateField('confirmPassword', values.confirmPassword);
    const dobValid = validateField('dateOfBirth', values.dateOfBirth);
    const guardianValid = isMinor ? validateField('guardianEmail', values.guardianEmail) : true;

    if (
      nValid && eValid && pValid && cpValid && dobValid && guardianValid &&
      values.name && values.email && values.password && values.confirmPassword && values.dateOfBirth &&
      (!isMinor || values.guardianEmail)
    ) {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    if (values.track) setStep(3);
    else toast.error('Please select a track to continue.');
  };

  const handleNextStep3 = () => {
    if (values.department && values.level && values.focusArea) setStep(4);
    else toast.error('Please select your department, class/level and area of focus to continue.');
  };

  useEffect(() => {
    // On success the server action sets the session and redirects to the dashboard,
    // so only errors surface here.
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const renderBackArrow = () => (
    <svg className="w-full h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9.1665 20.0034H31.6665" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.3334 30.0033C18.3334 30.0033 8.33351 22.6383 8.3335 20.0031C8.33348 17.3679 18.3335 10.0032 18.3335 10.0032" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
              className={`w-2 h-2 rounded-full relative z-10 transition-colors duration-300 ease-in-out ${s <= step ? 'bg-indigo-800' : 'bg-indigo-200'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Header (steps 1-3; step 4 has its own centered layout) */}
      {step < 4 && (
        <div className="inline-flex w-full max-w-[466px] flex-col items-start gap-2 mb-8">
          <div className="inline-flex items-center justify-start gap-3">
            {step > 1 ? (
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
              {step === 2 && 'Choose your learning track'}
              {step === 3 && 'Customize your path'}
            </h1>
          </div>
          <p className="flex flex-col justify-center self-stretch text-[14px] lg:text-[16px] font-normal text-indigo-950 break-words">
            {step === 1 && 'Let’s get you started on your learning journey'}
            {step === 2 && 'This helps us personalize your experience'}
            {step === 3 && 'Choose your department, class and area of focus'}
          </p>
        </div>
      )}

      {/* Form Content */}
      <form action={formAction} className="w-full relative">
        {/* Hidden inputs to pass data collected across steps to the final Server Action.
            The password fields are only mounted on the submit step (4) to keep them
            out of the DOM for the rest of the flow. */}
        <input type="hidden" name="name" value={values.name} />
        <input type="hidden" name="email" value={values.email} />
        {step === 4 && (
          <>
            <input type="hidden" name="password" value={values.password} />
            <input type="hidden" name="confirmPassword" value={values.confirmPassword} />
          </>
        )}
        <input type="hidden" name="dateOfBirth" value={values.dateOfBirth} />
        <input type="hidden" name="guardianEmail" value={values.guardianEmail} />
        <input type="hidden" name="track" value={values.track} />
        <input type="hidden" name="department" value={values.department} />
        <input type="hidden" name="level" value={values.level} />
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
                    <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5" />
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
                    <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5" />
                    {showConfirm && <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                  </svg>
                </button>
              </div>
              {getError('confirmPassword') && <p className="text-sm text-destructive">{getError('confirmPassword')}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="register-dob" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Date of Birth</label>
              <input id="register-dob" type="date" min={MIN_DOB} max={MAX_DOB} value={values.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} onBlur={() => handleBlur('dateOfBirth')} className={`w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 text-[12px] lg:text-[14px] font-sans font-normal focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${getError('dateOfBirth') ? 'border-destructive' : ''}`} />
              {getError('dateOfBirth') && <p className="text-sm text-destructive">{getError('dateOfBirth')}</p>}
            </div>

            {isMinor && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <label htmlFor="register-guardian-email" className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 break-words">Guardian&apos;s Email</label>
                <p className="text-[12px] lg:text-[14px] font-sans text-indigo-800">
                  Since you&apos;re under 18, we&apos;ll let your guardian know you&apos;re using GIREAPP. Your courses and dashboard are ready right away — this only affects the Mentorship feature until they confirm.
                </p>
                <input id="register-guardian-email" type="email" placeholder="guardian@example.com" value={values.guardianEmail} onChange={(e) => handleChange('guardianEmail', e.target.value)} onBlur={() => handleBlur('guardianEmail')} className={`w-full h-[54px] px-3 lg:px-4 bg-white rounded-lg border border-indigo-200 text-indigo-950 placeholder:text-indigo-400 text-[12px] lg:text-[14px] font-sans font-normal focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow ${getError('guardianEmail') ? 'border-destructive' : ''}`} />
                {getError('guardianEmail') && <p className="text-sm text-destructive">{getError('guardianEmail')}</p>}
              </div>
            )}

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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out flex flex-col gap-6">
            {TRACKS.map((track) => {
              const selected = values.track === track.id;
              const { Icon } = track;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleChange('track', track.id)}
                  aria-pressed={selected}
                  className={`w-full p-4 rounded-lg border-[0.5px] flex items-center gap-4 text-left transition-all duration-200 outline-none ${
                    selected ? 'border-transparent bg-indigo-200' : `bg-transparent ${track.border} hover:bg-indigo-50/40`
                  }`}
                >
                  <span className={`shrink-0 ${selected ? track.iconSelected : 'text-indigo-500'}`}>
                    <Icon />
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="text-[16px] lg:text-[20px] font-heading font-bold text-indigo-950 leading-none">{track.title}</span>
                    <span className="text-[14px] font-sans font-normal text-indigo-950 leading-none">{track.description}</span>
                    <span className="text-[12px] font-sans font-normal text-indigo-500 leading-none">{track.detail}</span>
                  </div>
                  {selected && <span className={`ml-auto h-2.5 w-2.5 shrink-0 rounded-full ${track.dot}`} aria-hidden="true" />}
                </button>
              );
            })}

            <button type="button" onClick={handleNextStep2} className="w-full flex items-center justify-center gap-2 h-[54px] lg:h-[56px] mt-2 bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors">
              Continue
            </button>
          </div>
        )}

        {/* STEP 3: Customize Path */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out space-y-6 lg:space-y-8">
            {CUSTOMIZE_FIELDS.map((field) => (
              <div key={field.id} className="flex flex-col gap-2">
                <label htmlFor={`register-${field.id}`} className="text-[16px] font-heading font-bold text-indigo-950 break-words">{field.label}</label>
                <div className="relative">
                  <select
                    id={`register-${field.id}`}
                    value={values[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full h-[54px] px-3 pr-10 bg-indigo-100 rounded-lg border border-indigo-200 text-indigo-400 text-[12px] lg:text-[14px] font-sans appearance-none outline-none cursor-pointer focus:ring-2 focus:ring-indigo-400 transition-shadow"
                  >
                    <option value="" disabled>{field.placeholder}</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" aria-hidden="true" />
                </div>
              </div>
            ))}

            <button type="button" onClick={handleNextStep3} className="w-full flex items-center justify-center gap-2 h-[54px] lg:h-[56px] mt-8 bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors">
              Continue
            </button>
          </div>
        )}

        {/* STEP 4: Review & Confirm */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out flex flex-col gap-6">
            <div className="relative flex justify-center">
              <Image src="/confetti.svg" alt="" aria-hidden width={346} height={194} className="pointer-events-none absolute left-1/2 top-1/2 w-[288px] h-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none" />
              <svg className="relative h-24 w-24" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="80" cy="80" r="66.667" fill="#3730A3" />
                <path d="M56 82L72 98L104 64" stroke="#F97316" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex flex-col gap-1 text-center">
              <h2 className="text-[20px] lg:text-[24px] font-heading font-bold text-indigo-950">
                {values.name.trim() ? `You’re all set, ${values.name.trim().split(' ')[0]?.toUpperCase()}!` : 'You’re all set!'}
              </h2>
              <p className="text-[14px] lg:text-[16px] font-sans text-indigo-950">Your dashboard is ready.</p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <SummaryCheck />
                <span className="text-[14px] font-sans text-indigo-950">Track: {values.track}</span>
              </div>
              <div className="flex items-center gap-2">
                <SummaryCheck />
                <span className="text-[14px] font-sans text-indigo-950">Department: {values.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <SummaryCheck />
                <span className="text-[14px] font-sans text-indigo-950">Class: {values.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <SummaryCheck />
                <span className="text-[14px] font-sans text-indigo-950">Area of focus: {values.focusArea}</span>
              </div>
              {isMinor && values.guardianEmail && (
                <div className="flex items-center gap-2">
                  <SummaryCheck />
                  <span className="text-[14px] font-sans text-indigo-950">Guardian email: {values.guardianEmail} (we&apos;ll ask them to confirm)</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-2">
              <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 h-[54px] lg:h-[56px] bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Creating...</>
                ) : 'Go to Dashboard'}
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={isPending} className="flex-1 flex items-center justify-center h-[54px] lg:h-[56px] border border-indigo-800 text-indigo-800 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50">
                Back
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
