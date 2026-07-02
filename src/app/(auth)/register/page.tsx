// ─────────────────────────────────────────────────
// GIREAPP — Register Page (M2: FE-AUTH-002)
// Form: name, email, password, confirmation
// Zod validation, disabled submit with spinner
// ─────────────────────────────────────────────────

import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Register for GIREAPP — Get It Right Edu App. Start your personalised learning journey.',
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col">
      <RegisterForm />
    </div>
  );
}
