import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/landing-page/site-header";
import { SiteFooter } from "@/components/landing-page/site-footer";

export const metadata: Metadata = {
  title: "Privacy notice | GIREAPP",
  description:
    "What personal information GIREAPP collects, why, who it is shared with, and your rights.",
};

const LAST_UPDATED = "18 October 2026";
const CONTACT_EMAIL = "support@gireapp.com";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-indigo-800 font-plus-jakarta-sans">
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-indigo-950 font-inter">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-indigo-50">
      <SiteHeader />

      <main
        id="main-content"
        className="flex-1 w-full max-w-3xl px-4 py-16 mx-auto md:py-24 md:px-6"
      >
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-indigo-800 font-plus-jakarta-sans">
          Privacy notice
        </h1>
        <p className="mt-4 text-sm text-indigo-500 font-inter">
          Last updated {LAST_UPDATED}
        </p>
        <p className="mt-6 leading-relaxed text-indigo-950 font-inter">
          GIREAPP runs the GIREAPP learning platform. This notice explains what
          personal information we collect, why we collect it, and the choices
          you have. It is an interim notice while our full privacy policy is
          prepared, and we will update this page when that is published.
        </p>

        <Section title="What we collect">
          <ul className="pl-5 space-y-2 list-disc">
            <li>
              <strong>Account details:</strong> your name, email address,
              password (stored only in a form that cannot be turned back into
              the password), your track and your department.
            </li>
            <li>
              <strong>Date of birth,</strong> so we know whether you are under
              18. For learners under 18, a parent or guardian&apos;s email
              address, so we can ask them to confirm.
            </li>
            <li>
              <strong>Profile details you choose to add:</strong> a profile
              photo and your learning preferences.
            </li>
            <li>
              <strong>Learning activity:</strong> the courses you join, the
              lessons you complete, your quiz answers and scores, and the points
              and badges you earn.
            </li>
            <li>
              <strong>Messages you send us</strong> through Contact Support.
            </li>
            <li>
              <strong>Technical information:</strong> your IP address and basic
              details of each request, which we use to keep the platform secure
              and to prevent abuse.
            </li>
          </ul>
        </Section>

        <Section title="How we use it">
          <p>
            We use your information to run your account, show you the courses
            for your track, track your progress, send you account emails (such
            as email verification and password resets), answer your support
            requests, and keep the platform secure.
          </p>
          <p>
            We do not sell your personal information, and we do not use it for
            advertising.
          </p>
        </Section>

        <Section title="Learners under 18">
          <p>
            Learners under 18 can use courses and quizzes straight away. Before
            they can use features that involve contact with adults, such as
            mentorship, we ask a parent or guardian to confirm by email.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            We use one essential cookie to keep you signed in. Scripts on the
            page cannot read it. Your answer to our cookie banner is remembered
            in your browser.
          </p>
          <p>
            We do not currently use analytics. If we add them, they will only
            run if you accept cookies.
          </p>
        </Section>

        <Section title="Who we share it with">
          <p>
            We use service providers to host and run the platform: website and
            server hosting, our database, file storage and email delivery. They
            process your information only to provide those services to us.
          </p>
          <p>
            Some of these providers process data outside your country, including
            in the European Union and the United States.
          </p>
        </Section>

        <Section title="How we protect it">
          <p>
            Connections to GIREAPP are encrypted. Passwords are never stored in
            readable form. Uploaded files are kept private and shared only
            through links that expire after a short time, and staff can only see
            what their role requires.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            We keep your information while your account is open. We are
            finalising how long we keep it afterwards, and the full policy will
            set this out.
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            Depending on where you live, data protection law, including
            Nigeria&apos;s Data Protection Act, South Africa&apos;s POPIA and
            Ghana&apos;s Data Protection Act, lets you ask to see the
            information we hold about you, correct it, delete it, or object to
            how we use it.
          </p>
          <p>
            You can update your name, email address, photo and learning
            preferences at any time in your account settings. To ask for a copy
            of your information or to delete your account, contact us.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Email us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium underline text-indigo-800 hover:text-indigo-600"
            >
              {CONTACT_EMAIL}
            </a>
            , including if you are a parent or guardian, or don&apos;t have an
            account. If you do have one, you can also use{" "}
            <strong>Contact Support</strong> in your account settings.
          </p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
