import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { getSession } from "@/lib/session";
import { confirmEmailChangeAction } from "@/features/settings/actions";

export const metadata: Metadata = {
  title: "Confirm Email Change",
  description: "Confirm the new email address on your GIREAPP account.",
};

const ACTION_CLASSNAME =
  "flex h-[54px] w-full items-center justify-center rounded-lg bg-coral-500 font-heading text-[16px] font-bold text-indigo-50 transition-colors hover:bg-coral-600 lg:h-[56px] lg:text-[20px]";

function ConfirmationFailed({ reason }: { reason: string }) {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[20px] font-bold text-indigo-950 lg:text-[24px]">
          We couldn’t confirm that change
        </h1>
        <p className="font-sans text-[14px] text-indigo-950 lg:text-[16px]">
          {reason}
        </p>
      </div>
      {/* The change can simply be requested again — nothing was altered. */}
      <Link href="/dashboard/settings/email" className={ACTION_CLASSNAME}>
        Try again
      </Link>
    </div>
  );
}

export default async function ConfirmEmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <ConfirmationFailed reason="This link is missing its confirmation code. Please open the link from your email in full." />
    );
  }

  const [result, session] = await Promise.all([
    confirmEmailChangeAction(token),
    getSession(),
  ]);

  if (!result.success) {
    return (
      <ConfirmationFailed
        reason={result.error ?? "The link may be invalid or have expired."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 text-center">
      <svg
        className="mx-auto h-24 w-24"
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

      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[20px] font-bold text-indigo-950 lg:text-[24px]">
          Email address updated
        </h1>
        <p className="font-sans text-[14px] text-indigo-950 lg:text-[16px]">
          {result.data?.email
            ? `You now sign in with ${result.data.email}.`
            : "You now sign in with your new address."}
        </p>
      </div>

      {/* The link is as often opened on a phone with no session as on the
          device that asked for the change. */}
      <Link
        href={session ? "/dashboard/settings" : "/login"}
        className={ACTION_CLASSNAME}
      >
        {session ? "Back to settings" : "Log in to GIREAPP"}
      </Link>
    </div>
  );
}
