import Link from "next/link";
import { UserRoundPen } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { SETTINGS_CARD_CLASSNAME } from "@/features/settings/settings-rows";

/** "SECONDARY" + "Science" -> "Secondary . Science", as the Figma badge reads. */
function trackLabel(
  academicLevel: string | null,
  department: string | null,
): string | null {
  if (!academicLevel) return department;
  const level = academicLevel.charAt(0) + academicLevel.slice(1).toLowerCase();
  return department ? `${level} . ${department}` : level;
}

export function ProfileHero({
  name,
  email,
  academicLevel,
  department,
  image,
}: {
  name: string;
  email: string;
  academicLevel: string | null;
  department: string | null;
  image?: string | null;
}) {
  const track = trackLabel(academicLevel, department);

  return (
    <section
      className={`${SETTINGS_CARD_CLASSNAME} flex items-center gap-4 p-4 md:gap-8 md:p-6`}
    >
      {/* Figma shows a 150px portrait on desktop; until an avatar upload exists,
          initials stand in rather than a broken image. */}
      <Link
        href="/dashboard/settings/photo"
        aria-label="Change your profile photo"
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-200 font-heading text-[24px] font-bold text-indigo-800 md:h-[150px] md:w-[150px] md:text-[44px]"
      >
        {image ? (
          /* Avatars are arbitrary backend URLs, so next/image would need every
             host allow-listed up front; a plain img keeps them working. */
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-2">
        <p className="truncate font-heading text-[16px] font-bold text-indigo-950 md:text-[20px]">
          {name}
        </p>
        <p className="truncate font-sans text-[12px] text-indigo-800 md:font-heading md:text-[16px] md:font-medium">
          {email}
        </p>
        {track && (
          <span className="w-fit rounded-[10px] bg-indigo-200 px-3 py-1 font-sans text-[12px] text-indigo-800 md:text-[14px]">
            {track}
          </span>
        )}
      </div>

      <Link
        href="/dashboard/settings/photo"
        className="hidden shrink-0 items-center gap-2 self-start font-sans text-[16px] text-coral-500 transition-colors hover:text-coral-600 md:flex"
      >
        <UserRoundPen
          className="h-8 w-8"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        Edit Profile
      </Link>
    </section>
  );
}
