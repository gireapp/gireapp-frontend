// ─────────────────────────────────────────────────
// GIREAPP — Register Page (M2: FE-AUTH-002)
// Form: name, email, password, confirmation
// Zod validation, disabled submit with spinner
// ─────────────────────────────────────────────────

import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/register-form';
import { UserPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Register for GIREAPP — Get It Right Edu App. Start your personalised learning journey.',
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50/50 flex items-center justify-center text-indigo-500">
            <UserPlus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <h1 className="text-[28px] font-heading font-bold text-indigo-950">
            Create your account
          </h1>
        </div>
        <p className="text-[16px] text-indigo-950 ml-[52px]">
          Join GIREAPP and start your personalized learning journey
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
