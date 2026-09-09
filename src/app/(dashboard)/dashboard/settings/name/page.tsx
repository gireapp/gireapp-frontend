import type { Metadata } from "next";
import { SettingsSubHeader } from "@/features/settings/settings-sub-header";
import { UpdateNameForm } from "@/features/settings/update-name-form";
import { getSettingsIdentity } from "@/features/settings/profile-identity";

export const metadata: Metadata = {
  title: "Full Name",
  description: "Change the name shown on your GIREAPP profile.",
};

export default async function UpdateNamePage() {
  const { name } = await getSettingsIdentity();

  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-6 md:gap-10">
      <SettingsSubHeader title="Full Name" />
      <UpdateNameForm currentName={name} />
    </div>
  );
}
