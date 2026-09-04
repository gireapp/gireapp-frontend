import type { Metadata } from "next";
import Link from "next/link";
import { confirmGuardianConsentAction } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Guardian Consent",
  description: "Confirm a learner's GIREAPP account.",
};

// The guardian is not a GIREAPP user: no session exists, and this page is the
// entire interaction. It therefore states plainly what was and was not granted.
function Outcome({
  heading,
  body,
  tone,
}: {
  heading: string;
  body: string;
  tone: "success" | "error";
}) {
  const isSuccess = tone === "success";

  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col items-center gap-6 text-center lg:min-h-[calc(100vh-200px)] justify-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          isSuccess ? "bg-green-50" : "bg-destructive/10"
        }`}
      >
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {isSuccess ? (
            <path
              d="M5 12.5L10 17.5L19 7.5"
              stroke="#22C55E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <>
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
                className="text-destructive"
              />
              <path
                d="M12 7.5V13M12 16.5H12.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-destructive"
              />
            </>
          )}
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-[20px] lg:text-[28px] font-heading font-bold text-indigo-950 break-words">
          {heading}
        </h1>
        <p className="text-[14px] lg:text-[16px] font-sans font-normal text-indigo-950 break-words">
          {body}
        </p>
      </div>

      <Link
        href="/"
        className="flex items-center justify-center h-[54px] lg:h-[56px] w-full max-w-[280px] bg-coral-500 text-indigo-50 rounded-lg text-[16px] lg:text-[20px] font-heading font-bold hover:bg-coral-600 transition-colors"
      >
        Go to GIREAPP
      </Link>
    </div>
  );
}

export default async function GuardianConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Outcome
        tone="error"
        heading="This link is incomplete"
        body="The confirmation link is missing its token. Please open the link from your email again, or ask the learner to resend it."
      />
    );
  }

  const result = await confirmGuardianConsentAction(token);

  if (!result.success) {
    return (
      <Outcome
        tone="error"
        heading="We could not confirm consent"
        body={
          result.error ??
          "The link may have expired. Ask the learner to resend the confirmation email."
        }
      />
    );
  }

  const learnerName = result.data?.name;

  return (
    <Outcome
      tone="success"
      heading="Thank you — consent confirmed"
      body={
        learnerName
          ? `${learnerName} can now use Mentorship. Their courses and progress were never affected.`
          : "Mentorship is now available for this learner. Their courses and progress were never affected."
      }
    />
  );
}
