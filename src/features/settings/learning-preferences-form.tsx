"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Trophy, type LucideIcon } from "lucide-react";
import {
  DEPARTMENTS,
  MOOD_THEMES,
  type AcademicLevel,
  type ApiResponse,
} from "@gireapp/shared";
import { updateLearningPreferencesAction } from "@/features/settings/actions";
import {
  SETTINGS_LABEL_CLASSNAME,
  SettingsFormLayout,
  SettingsStatusPanel,
} from "@/features/settings/settings-form";

const initialState: ApiResponse = { success: false };

/**
 * Copy and accent colours are the onboarding track picker's own — this is the
 * same choice being revisited, so it should not describe itself differently.
 */
const TRACKS: {
  value: AcademicLevel;
  Icon: LucideIcon;
  label: string;
  description: string;
  hint: string;
  accent: string;
}[] = [
  {
    value: "SECONDARY",
    Icon: BookOpen,
    label: "Secondary",
    description: "For secondary school students",
    hint: "(SS1 - SS3)",
    accent: "border-indigo-800",
  },
  {
    value: "TERTIARY",
    Icon: GraduationCap,
    label: "Tertiary",
    description: "For tertiary institution students",
    hint: "Undergraduates and Postgraduates",
    accent: "border-coral-500",
  },
  {
    value: "PROFESSIONAL",
    Icon: Trophy,
    label: "Professional",
    description: "For industry professionals",
    hint: "Career Advancement Track",
    accent: "border-green-500",
  },
];

const MOOD_LABELS: Record<(typeof MOOD_THEMES)[number], string> = {
  calm: "🧘 Calm",
  focused: "🎯 Focused",
  energized: "⚡ Energized",
  relaxed: "🌿 Relaxed",
};

const CHIP_CLASSNAME =
  "rounded-[10px] border px-4 py-2 font-sans text-[12px] transition-colors md:text-[16px]";

function Chip({
  isSelected,
  onSelect,
  children,
}: {
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`${CHIP_CLASSNAME} ${
        isSelected
          ? "border-indigo-800 bg-indigo-100 text-indigo-950"
          : "border-indigo-200 text-indigo-800 hover:bg-indigo-100"
      }`}
    >
      {children}
    </button>
  );
}

export function LearningPreferencesForm({
  academicLevel,
  department,
  moodTheme,
}: {
  academicLevel: AcademicLevel | null;
  department: string | null;
  moodTheme: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateLearningPreferencesAction,
    initialState,
  );
  const router = useRouter();
  const [track, setTrack] = useState<AcademicLevel | "">(academicLevel ?? "");
  const [chosenDepartment, setChosenDepartment] = useState(department ?? "");
  const [mood, setMood] = useState(moodTheme ?? "calm");

  const departments = track ? DEPARTMENTS[track] : [];

  // A department only means something within its track, so switching tracks
  // clears it rather than submitting a pairing the schema would reject.
  function chooseTrack(next: AcademicLevel) {
    setTrack(next);
    setChosenDepartment(next === academicLevel ? (department ?? "") : "");
  }

  // The sidebar's Home link and the topbar badge both read the track.
  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  const errorMessage = state.success
    ? null
    : (state.errors?.academicLevel?.[0] ??
      state.errors?.department?.[0] ??
      state.error ??
      null);

  const panel = state.success ? (
    <SettingsStatusPanel
      variant="success"
      message="Preferences saved!"
      detail="Your dashboard and recommended courses follow this track."
    />
  ) : errorMessage ? (
    <SettingsStatusPanel variant="error" message={errorMessage} />
  ) : (
    <SettingsStatusPanel
      variant="info"
      message="This decides which courses you are shown and how your dashboard is organised."
    />
  );

  return (
    <SettingsFormLayout
      action={formAction}
      panel={panel}
      isPending={isPending}
      isDisabled={isPending || !track || !chosenDepartment}
    >
      <input type="hidden" name="academicLevel" value={track} />
      <input type="hidden" name="department" value={chosenDepartment} />
      <input type="hidden" name="moodTheme" value={mood} />

      <fieldset className="flex flex-col gap-4">
        <legend className={SETTINGS_LABEL_CLASSNAME}>Learning Track</legend>
        <div className="flex flex-col gap-3">
          {TRACKS.map(({ value, Icon, label, description, hint, accent }) => (
            <button
              key={value}
              type="button"
              onClick={() => chooseTrack(value)}
              aria-pressed={track === value}
              className={`flex items-center gap-4 rounded-lg border p-4 text-left transition-colors ${accent} ${
                track === value ? "bg-indigo-100" : "hover:bg-indigo-100/60"
              }`}
            >
              <Icon
                className="h-8 w-8 shrink-0 text-indigo-800"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="flex flex-col">
                <span className="font-heading text-[16px] font-bold text-indigo-950">
                  {label}
                </span>
                <span className="font-sans text-[14px] text-indigo-950">
                  {description}
                </span>
                <span className="font-sans text-[12px] text-indigo-500">
                  {hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className={SETTINGS_LABEL_CLASSNAME}>Department</legend>
        {track ? (
          <div className="flex flex-wrap gap-3">
            {departments.map((option) => (
              <Chip
                key={option}
                isSelected={chosenDepartment === option}
                onSelect={() => setChosenDepartment(option)}
              >
                {option}
              </Chip>
            ))}
          </div>
        ) : (
          <p className="font-sans text-[12px] text-indigo-400 md:text-[16px]">
            Choose a learning track first.
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className={SETTINGS_LABEL_CLASSNAME}>Study Mood</legend>
        <div className="flex flex-wrap gap-3">
          {MOOD_THEMES.map((option) => (
            <Chip
              key={option}
              isSelected={mood === option}
              onSelect={() => setMood(option)}
            >
              {MOOD_LABELS[option]}
            </Chip>
          ))}
        </div>
      </fieldset>
    </SettingsFormLayout>
  );
}
