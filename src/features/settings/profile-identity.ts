import { getSession } from "@/lib/session";
import { getDashboardOverview } from "@/features/dashboard/actions";

export type SettingsIdentity = {
  name: string;
  email: string;
  academicLevel: string | null;
  department: string | null;
  image: string | null;
};

/**
 * The learner's own details as every settings screen displays them. The
 * dashboard overview is the richer source and the session token the fallback,
 * so a failed overview fetch still renders a usable header rather than blanks.
 * Both reads are memoised for the request, so this costs no extra round trip.
 */
export async function getSettingsIdentity(): Promise<SettingsIdentity> {
  const [session, overview] = await Promise.all([
    getSession(),
    getDashboardOverview(),
  ]);
  const profile = overview?.profile;

  return {
    name: profile?.name ?? session?.email ?? "there",
    email: profile?.email ?? session?.email ?? "",
    academicLevel: profile?.academicLevel ?? session?.academicLevel ?? null,
    department: profile?.department ?? session?.department ?? null,
    image: profile?.image ?? null,
  };
}
