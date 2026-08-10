import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageHeader } from "@/components/shared/auth-page-header";
import { ResendVerificationPanel } from "@/features/auth/resend-verification-panel";
import { getPendingVerificationEmail } from "@/lib/pending-verification";

export const metadata: Metadata = {
  title: "Check Your Inbox",
  description: "Verify your GIREAPP email address to finish signing up.",
};

function MailIcon() {
  return (
    <svg
      className="w-8 h-8 lg:w-9 lg:h-9 text-indigo-800"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.5 6L10.6 12.2C11.4 12.8 12.6 12.8 13.4 12.2L21.5 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function CheckEmailPage() {
  const email = await getPendingVerificationEmail();

  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col gap-8 lg:min-h-[calc(100vh-200px)] justify-center">
      <AuthPageHeader
        title="Check your inbox"
        subtitle={
          email
            ? `We sent a verification link to ${email}. Open it to activate your account.`
            : "We sent you a verification link. Open it to activate your account."
        }
        backHref="/login"
        backLabel="Go back to log in"
      />

      <div className="flex flex-col gap-6 p-6 bg-white/80 border border-indigo-200 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center">
            <MailIcon />
          </div>
          <p className="text-[14px] lg:text-[16px] font-sans text-indigo-950 break-words">
            The link expires in 24 hours. You won&apos;t be able to log in until
            your email is verified.
          </p>
        </div>

        {email ? (
          <ResendVerificationPanel email={email} />
        ) : (
          <p className="text-[12px] lg:text-[14px] font-sans text-indigo-800 text-center">
            Need a new link? Log in and we&apos;ll offer to resend it.
          </p>
        )}
      </div>

      <p className="text-center text-[12px] lg:text-[14px] font-sans text-indigo-800">
        Wrong email address?{" "}
        <Link
          href="/register"
          className="text-coral-500 font-normal hover:underline ml-1"
        >
          Sign up again
        </Link>
      </p>
    </div>
  );
}
