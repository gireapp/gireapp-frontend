import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Headphones } from "lucide-react";
import { SettingsSubHeader } from "@/features/settings/settings-sub-header";
import { HELP_TOPICS } from "@/features/settings/help-topics";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers to the questions GIREAPP learners ask most.",
};

export default function HelpCenterPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-6 md:gap-10">
      <SettingsSubHeader title="Help Center" />

      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-16">
        <div className="flex flex-col gap-6 md:w-[467px]">
          {HELP_TOPICS.map((topic) => (
            <section key={topic.title} className="flex flex-col gap-2 md:gap-3">
              <h2 className="font-heading text-[16px] font-bold text-indigo-950 md:text-[20px]">
                {topic.title}
              </h2>
              {/* <details> keeps this a Server Component: no state to hydrate,
                  and it stays usable before JavaScript arrives. */}
              <div className="flex flex-col rounded-[10px] border border-indigo-200 [&>*+*]:border-t [&>*+*]:border-indigo-200">
                {topic.entries.map((entry) => (
                  <details key={entry.question} className="group px-4 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-[14px] text-indigo-950 md:text-[16px]">
                      {entry.question}
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-indigo-400 transition-transform group-open:rotate-180"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-2 font-sans text-[12px] leading-relaxed text-indigo-800 md:text-[14px]">
                      {entry.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="flex flex-col gap-4 rounded-[10px] bg-indigo-100 p-4 md:w-[320px] md:p-6">
          <Headphones
            className="h-8 w-8 text-indigo-800 md:h-12 md:w-12"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <p className="font-heading text-[16px] font-bold text-indigo-950 md:text-[20px]">
              Still stuck?
            </p>
            <p className="font-sans text-[12px] text-indigo-800 md:text-[14px]">
              Tell us what happened and we will reply by email.
            </p>
          </div>
          <Link
            href="/dashboard/support"
            className="flex h-10 w-full items-center justify-center rounded-[10px] bg-coral-500 font-heading text-[16px] font-bold text-indigo-50 transition-colors hover:bg-coral-600 md:h-12"
          >
            Contact Support
          </Link>
        </aside>
      </div>
    </div>
  );
}
