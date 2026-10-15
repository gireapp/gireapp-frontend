import type { Metadata } from "next";
import { SettingsSubHeader } from "@/features/settings/settings-sub-header";
import { ChangePasswordForm } from "@/features/settings/change-password-form";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Choose a new password for your GIREAPP account.",
};

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-6 md:gap-10">
      <SettingsSubHeader title="Change Password" />
      <ChangePasswordForm />
    </div>
  );
}
