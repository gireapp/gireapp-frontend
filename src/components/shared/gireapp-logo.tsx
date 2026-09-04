import Image from "next/image";
import Link from "next/link";

/** Official lockup: 28px rounded mark plus the GIREAPP wordmark, 106×28. */
const LOGO_ASPECT_RATIO = 106 / 28;

const LOGO_SRC = {
  /** White wordmark — for indigo-800 and other dark surfaces. */
  onDark: "/logo-white.svg",
  /** Indigo-800 wordmark — for indigo-50 and other light surfaces. */
  onLight: "/logo-indigo.svg",
} as const;

export type LogoSurface = keyof typeof LOGO_SRC;

/**
 * Renders the brand lockup at a given height, width derived from the artwork's
 * own ratio. Pages should never rebuild the mark and wordmark by hand — the
 * spacing and letterforms live in the asset.
 */
export function GireappLogo({
  surface = "onDark",
  height = 28,
  href,
  className,
  priority = false,
}: {
  surface?: LogoSurface;
  height?: number;
  /** Wraps the mark in a link when given — omit for decorative placements. */
  href?: string;
  className?: string;
  priority?: boolean;
}) {
  const image = (
    <Image
      src={LOGO_SRC[surface]}
      alt="GIREAPP"
      width={Math.round(height * LOGO_ASPECT_RATIO)}
      height={height}
      priority={priority}
      className={className}
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
