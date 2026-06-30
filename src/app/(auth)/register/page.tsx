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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-h2 text-foreground">Create your account</h1>
        <p className="text-body-sm text-muted-foreground">
          Join GIREAPP and start your personalised learning journey
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
