import type { Metadata } from "next";
import { SettingsSubHeader } from "@/features/settings/settings-sub-header";
import { UpdateEmailForm } from "@/features/settings/update-email-form";
import { getSettingsIdentity } from "@/features/settings/profile-identity";

export const metadata: Metadata = {
  title: "Update Email",
  description: "Change the email address on your GIREAPP account.",
};

export default async function UpdateEmailPage() {
  const { email } = await getSettingsIdentity();

  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-6 md:gap-10">
      <SettingsSubHeader title="Update Email" />
      <UpdateEmailForm currentEmail={email} />
    </div>
  );
}
