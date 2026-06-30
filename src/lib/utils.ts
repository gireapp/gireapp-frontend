// ─────────────────────────────────────────────────
// GIREAPP — Utility Functions
// cn() helper, formatters, sanitizers
// ─────────────────────────────────────────────────

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number with commas (e.g., 1,234) */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/** Format a date relative to now (e.g., "2 hours ago") */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format seconds into mm:ss for quiz timer */
export function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** Format percentage (0–1 float to display) */
export function formatProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

/** Generate user initials from name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Sanitize user input — strip potential XSS vectors */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/javascript:/gi, '') // Strip JS protocol
    .replace(/on\w+=/gi, '') // Strip event handlers
    .trim();
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/** Calculate estimated reading time in minutes */
export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/** Determine if a connection is slow (for data-saver mode) */
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  };
  const conn = nav.connection;
  if (!conn) return false;
  return conn.saveData === true || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
}

/** Sleep utility for staggered animations */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate a random ID (for client-side temp keys only) */
export function tempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
