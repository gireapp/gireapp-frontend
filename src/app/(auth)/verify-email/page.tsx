import type { Metadata } from "next";
import { verifyEmailAction } from "@/features/auth/actions";
import { XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your GIREAPP account email address.",
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
            {result.error ?? "The link may be invalid or expired."}
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

  const firstName = result.data?.name?.trim().split(" ")[0]?.toUpperCase();

  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="relative flex justify-center">
        <Image
          src="/confetti.svg"
          alt=""
          aria-hidden
          width={346}
          height={194}
          className="pointer-events-none absolute left-1/2 top-1/2 w-[288px] h-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
        />
        <svg
          className="relative h-24 w-24"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="80" cy="80" r="66.667" fill="#3730A3" />
          <path
            d="M56 82L72 98L104 64"
            stroke="#F97316"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-[20px] lg:text-[24px] font-heading font-bold text-indigo-950">
          {firstName ? `You’re all set, ${firstName}!` : "You’re all set!"}
        </h1>
        <p className="text-[14px] lg:text-[16px] font-sans text-indigo-950">
          Your email is verified and your dashboard is ready.
        </p>
      </div>

      <Link
        href="/login"
        className="w-full flex items-center justify-center h-[54px] lg:h-[56px] bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors"
      >
        Log in to GIREAPP
      </Link>
    </div>
  );
}
