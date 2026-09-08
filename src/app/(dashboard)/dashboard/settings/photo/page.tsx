import type { Metadata } from "next";
import { SettingsSubHeader } from "@/features/settings/settings-sub-header";
import { ChangePhotoForm } from "@/features/settings/change-photo-form";
import { getSettingsIdentity } from "@/features/settings/profile-identity";

export const metadata: Metadata = {
  title: "Profile Photo",
  description: "Change the photo on your GIREAPP profile.",
};

export default async function ChangePhotoPage() {
  const { name, image } = await getSettingsIdentity();

  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-6 md:gap-10">
      <SettingsSubHeader title="Profile Photo" />
      <ChangePhotoForm name={name} currentImage={image} />
    </div>
  );
}
