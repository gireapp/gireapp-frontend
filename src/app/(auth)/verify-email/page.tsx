import type { Metadata } from 'next';
import { verifyEmailAction } from '@/features/auth/actions';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your GIREAPP account email address.',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-h2 text-foreground">Verification Failed</h1>
          <p className="text-body-sm text-muted-foreground">
            Missing verification token. Please check the link in your email.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const result = await verifyEmailAction(token);

  if (!result.success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-h2 text-foreground">Verification Failed</h1>
          <p className="text-body-sm text-muted-foreground">
            {result.error ?? 'The link may be invalid or expired.'}
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-h2 text-foreground">Email Verified!</h1>
        <p className="text-body-sm text-muted-foreground">
          {result.data?.message ?? 'Your email has been verified. You can now log in.'}
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Log In to GIREAPP
      </Link>
    </div>
  );
}
