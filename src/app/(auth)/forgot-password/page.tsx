import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your GIREAPP password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-h2 text-foreground">Forgot password?</h1>
        <p className="text-body-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
