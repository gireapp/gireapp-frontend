import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/features/auth/reset-password-form';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Create a new password for your GIREAPP account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-h2 text-foreground">Create new password</h1>
        <p className="text-body-sm text-muted-foreground">
          Your new password must be different from previous used passwords.
        </p>
      </div>
      <Suspense fallback={<div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
