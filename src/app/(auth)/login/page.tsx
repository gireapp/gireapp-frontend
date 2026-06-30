import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/login-form';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your GIREAPP account to continue learning.',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-h2 text-foreground">Welcome back</h1>
        <p className="text-body-sm text-muted-foreground">
          Log in to continue your learning journey
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
