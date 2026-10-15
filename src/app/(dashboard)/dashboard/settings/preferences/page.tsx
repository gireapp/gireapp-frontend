import type { Metadata } from "next";
import type { AcademicLevel } from "@gireapp/shared";
import { getSession } from "@/lib/session";
import { getDashboardOverview } from "@/features/dashboard/actions";
import { SettingsSubHeader } from "@/features/settings/settings-sub-header";
import { LearningPreferencesForm } from "@/features/settings/learning-preferences-form";

export const metadata: Metadata = {
  title: "Learning Preferences",
  description:
    "Choose the track, department and mood that shape your GIREAPP dashboard.",
};

export default async function LearningPreferencesPage() {
  const [session, overview] = await Promise.all([
    getSession(),
    getDashboardOverview(),
  ]);
  const profile = overview?.profile;

  return (
    <div className="mx-auto flex w-full max-w-[1143px] flex-col gap-6 md:gap-10">
      <SettingsSubHeader title="Learning Preferences" />
      <LearningPreferencesForm
        academicLevel={
          (profile?.academicLevel ??
            session?.academicLevel ??
            null) as AcademicLevel | null
        }
        department={profile?.department ?? session?.department ?? null}
        moodTheme={profile?.moodTheme ?? null}
      />
    </div>
  );
}
