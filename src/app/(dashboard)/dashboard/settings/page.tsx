import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  UserCircle,
  Mail,
  LockKeyhole,
  SlidersVertical,
  HelpCircle,
  Headphones,
  LogOut,
} from "lucide-react";
import { homeHref } from "@/features/dashboard/nav-items";
import { logoutAction } from "@/features/auth/actions";
import { getDashboardOverview } from "@/features/dashboard/actions";
import { DashboardTopbar } from "@/features/dashboard/dashboard-topbar";
import { getSettingsIdentity } from "@/features/settings/profile-identity";
import { ProfileHero } from "@/features/settings/profile-hero";
import {
  SettingsRow,
  SettingsSection,
} from "@/features/settings/settings-rows";

export const metadata: Metadata = {
  title: "Profile & Settings",
  description: "Manage your GIREAPP account, security and preferences.",
};

export default async function SettingsPage() {
  const [{ name, email, academicLevel, department, image }, overview] =
    await Promise.all([getSettingsIdentity(), getDashboardOverview()]);

  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-6 md:gap-8">
      {/* Mobile leads with a back arrow and a centred title; desktop keeps the
          dashboard topbar and moves the title to the left margin. */}
      <div className="hidden md:block">
        <DashboardTopbar
          name={name}
          department={department}
          academicLevel={academicLevel}
          points={overview?.totalPoints ?? 0}
        />
      </div>

      <div className="relative flex items-center md:block">
        <Link
          href={homeHref(academicLevel)}
          aria-label="Back to dashboard"
          className="text-indigo-800 md:hidden"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-heading text-[20px] font-bold text-indigo-950 md:static md:translate-x-0 md:text-[28px]">
          Profile &amp; Settings
        </h1>
      </div>

      <ProfileHero
        name={name}
        email={email}
        academicLevel={academicLevel}
        department={department}
        image={image}
      />

      {/* Figma stacks these in one column on mobile and pairs them across the
          content width on desktop. */}
      <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-6">
        <SettingsSection title="Basic Information">
          <SettingsRow
            icon={UserCircle}
            label="Full Name"
            value={name}
            href="/dashboard/settings/name"
          />
          <SettingsRow
            icon={Mail}
            label="Email Address"
            value={email}
            href="/dashboard/settings/email"
          />
        </SettingsSection>

        <SettingsSection title="Security">
          <SettingsRow
            icon={LockKeyhole}
            label="Change Password"
            href="/dashboard/settings/password"
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsRow
            icon={SlidersVertical}
            label="Learning Preferences"
            href="/dashboard/settings/preferences"
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow
            icon={HelpCircle}
            label="Help Center"
            href="/dashboard/help"
          />
          <SettingsRow
            icon={Headphones}
            label="Contact Support"
            href="/dashboard/support"
          />
        </SettingsSection>

        <SettingsSection className="md:col-span-2">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-[10px] px-2 py-3 text-left transition-colors hover:bg-indigo-200/60 md:px-4"
            >
              <LogOut
                className="h-8 w-8 shrink-0 text-red-500"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="font-sans text-[14px] text-indigo-950 md:text-[16px]">
                Logout
              </span>
            </button>
          </form>
        </SettingsSection>
      </div>
    </div>
  );
}
