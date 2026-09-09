import type { Metadata } from "next";
import { SettingsSubHeader } from "@/features/settings/settings-sub-header";
import { ContactSupportForm } from "@/features/settings/contact-support-form";
import { getSettingsIdentity } from "@/features/settings/profile-identity";

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Send the GIREAPP team a message about your account.",
};

export default async function ContactSupportPage() {
  const { email } = await getSettingsIdentity();

  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-6 md:gap-10">
      <SettingsSubHeader title="Contact Support" />
      <ContactSupportForm replyTo={email} />
    </div>
  );
}
