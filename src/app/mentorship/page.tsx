import type { Metadata } from "next";
import { Compass, ShieldCheck, Users } from "lucide-react";
import { SafeLink } from "@/components/shared/safe-link";
import { SiteHeader } from "@/components/landing-page/site-header";
import { SiteFooter } from "@/components/landing-page/site-footer";

export const metadata: Metadata = {
  title: "Mentorship — coming soon | GIREAPP",
  description:
    "GIREAPP is partnering with academic counsellors and industry mentors to bring one-to-one guidance to learners across Africa.",
};

const PLANS = [
  {
    icon: Users,
    title: "Verified mentors",
    description:
      "Academic counsellors and industry professionals, checked before they join.",
  },
  {
    icon: Compass,
    title: "Matched to your track",
    description:
      "Guidance for where you are: secondary school, university or your career.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by design",
    description:
      "Learners under 18 need a parent or guardian to confirm before mentorship opens to them.",
  },
];

export default function MentorshipPage() {
  return (
    <div className="flex flex-col min-h-screen bg-indigo-50">
      <SiteHeader />

      <main
        id="main-content"
        className="flex-1 w-full max-w-3xl px-4 py-16 mx-auto md:py-24 md:px-6"
      >
        <p className="inline-flex px-3 py-1 mb-6 text-sm font-medium text-orange-600 bg-orange-100 rounded-full font-inter">
          Coming soon
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-indigo-800 font-plus-jakarta-sans">
          Mentorship is coming to GIREAPP
        </h1>
        <p className="mt-6 text-base leading-relaxed md:text-lg text-indigo-500 font-inter">
          We&apos;re building a mentorship programme that connects learners with
          academic counsellors and industry mentors. We&apos;re working with
          partners now to bring the right people on board, and we&apos;ll open
          it up as soon as they&apos;re ready.
        </p>

        <ul className="grid gap-4 mt-12 sm:grid-cols-3">
          {PLANS.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="p-5 bg-white border border-indigo-100 rounded-2xl"
            >
              <Icon className="w-7 h-7 text-indigo-500" aria-hidden="true" />
              <h2 className="mt-3 font-bold text-indigo-800 font-plus-jakarta-sans">
                {title}
              </h2>
              <p className="mt-1 text-sm text-indigo-500 font-inter">
                {description}
              </p>
            </li>
          ))}
        </ul>

        <div className="p-6 mt-12 bg-indigo-800 rounded-2xl md:p-8">
          <h2 className="text-xl font-bold text-indigo-50 font-plus-jakarta-sans">
            In the meantime, start learning
          </h2>
          <p className="mt-2 text-indigo-200 font-inter">
            Courses and quizzes for your track are open now, and they&apos;re
            free.
          </p>
          <SafeLink
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3 mt-6 text-white bg-orange-500 rounded-lg hover:bg-orange-500/90 font-plus-jakarta-sans"
          >
            Create Free Account
          </SafeLink>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
