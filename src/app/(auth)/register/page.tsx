// ─────────────────────────────────────────────────
// GIREAPP — Register Page (M2: FE-AUTH-002)
// Form: name, email, password, confirmation
// Zod validation, disabled submit with spinner
// ─────────────────────────────────────────────────

import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Register for GIREAPP — Get It Right Edu App. Start your personalised learning journey.',
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col gap-8">
      <div className="inline-flex w-full max-w-[466px] flex-col items-start gap-2">
        <div className="inline-flex items-center justify-start gap-3">
          <div className="relative h-10 w-10 shrink-0">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9.1665 20.0034H31.6665" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.3334 30.0033C18.3334 30.0033 8.33351 22.6383 8.3335 20.0031C8.33348 17.3679 18.3335 10.0032 18.3335 10.0032" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="flex flex-col justify-center text-[28px] font-bold text-indigo-950 font-heading break-words">
            Create your account
          </h1>
        </div>
        <p className="flex flex-col justify-center self-stretch text-base font-normal text-indigo-950 break-words">
          Join GIREAPP and start your personalized learning journey
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
