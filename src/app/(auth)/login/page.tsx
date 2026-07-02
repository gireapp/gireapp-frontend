import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/login-form';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your GIREAPP account to continue learning.',
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col gap-8 lg:min-h-[calc(100vh-200px)] justify-center">
      <div className="inline-flex w-full max-w-[466px] flex-col items-start gap-2">
        <div className="inline-flex items-center justify-start gap-3">
          <Link 
            href="/" 
            className="relative h-6 w-6 lg:h-10 lg:w-10 shrink-0 hover:bg-indigo-50/50 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Go back to landing page"
          >
            <svg className="w-full h-full" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9.1665 20.0034H31.6665" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.3334 30.0033C18.3334 30.0033 8.33351 22.6383 8.3335 20.0031C8.33348 17.3679 18.3335 10.0032 18.3335 10.0032" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="flex flex-col justify-center text-[20px] lg:text-[28px] font-bold text-indigo-950 font-heading break-words">
            Welcome back
          </h1>
        </div>
        <p className="w-full text-[14px] lg:text-[16px] text-indigo-950 font-sans font-normal break-words">
          Log in to continue your learning journey
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
