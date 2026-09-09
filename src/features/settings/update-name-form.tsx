"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@gireapp/shared";
import { updateNameAction } from "@/features/settings/actions";
import {
  SettingsFormLayout,
  SettingsStatusPanel,
  SettingsTextField,
} from "@/features/settings/settings-form";

const initialState: ApiResponse = { success: false };

export function UpdateNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, isPending] = useActionState(
    updateNameAction,
    initialState,
  );
  const router = useRouter();
  const [name, setName] = useState(currentName);

  // The topbar and sidebar greet the learner by name.
  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  const fieldError = state.errors?.name?.[0];
  const errorMessage = state.success
    ? null
    : (fieldError ?? state.error ?? null);

  const panel = state.success ? (
    <SettingsStatusPanel
      variant="success"
      message="Name updated successfully!"
      detail="This is the name shown across GIREAPP."
    />
  ) : errorMessage ? (
    <SettingsStatusPanel variant="error" message={errorMessage} />
  ) : (
    <SettingsStatusPanel
      variant="info"
      message="This is the name shown on your dashboard, your certificates and to your mentors."
    />
  );

  return (
    <SettingsFormLayout
      action={formAction}
      panel={panel}
      isPending={isPending}
      // Nothing to save until the name actually differs from the stored one.
      isDisabled={isPending || name.trim() === currentName.trim()}
    >
      <SettingsTextField
        name="name"
        label="Full Name"
        placeholder="Enter your full name"
        autoComplete="name"
        value={name}
        onChange={setName}
        error={fieldError}
        isDisabled={isPending}
      />
    </SettingsFormLayout>
  );
}
