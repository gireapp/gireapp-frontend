// ─────────────────────────────────────────────────
// GIREAPP — Theme Provider
// next-themes wrapper for dark mode support
// ─────────────────────────────────────────────────

'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
