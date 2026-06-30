// ─────────────────────────────────────────────────
// GIREAPP — SafeLink Component
// Prevents duplicate navigation from rapid clicks
// Used on CTA buttons across the landing page
// ─────────────────────────────────────────────────

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, type ComponentProps } from 'react';

type SafeLinkProps = ComponentProps<typeof Link>;

/**
 * A wrapper around Next.js Link that prevents duplicate navigation events
 * when users rapidly click CTA buttons. Uses a ref-based cooldown to block
 * subsequent clicks within 500ms of the first navigation.
 */
export function SafeLink({ href, onClick, children, ...props }: SafeLinkProps) {
  const isNavigating = useRef(false);
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // If already navigating, prevent the duplicate click
      if (isNavigating.current) {
        e.preventDefault();
        return;
      }

      // Mark as navigating
      isNavigating.current = true;

      // Call any existing onClick handler
      if (onClick) {
        (onClick as (e: React.MouseEvent<HTMLAnchorElement>) => void)(e);
      }

      // Reset after navigation completes or timeout
      setTimeout(() => {
        isNavigating.current = false;
      }, 500);
    },
    [onClick]
  );

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
