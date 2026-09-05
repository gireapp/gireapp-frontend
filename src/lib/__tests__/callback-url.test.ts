import { describe, it, expect } from 'vitest';
import { safeCallbackUrl } from '../callback-url';

describe('safeCallbackUrl', () => {
  it('accepts a normal relative path', () => {
    expect(safeCallbackUrl('/dashboard/courses/abc')).toBe('/dashboard/courses/abc');
  });

  it('accepts a path with query string', () => {
    expect(safeCallbackUrl('/dashboard?tab=courses')).toBe('/dashboard?tab=courses');
  });

  it('falls back for null, undefined, and empty values', () => {
    expect(safeCallbackUrl(null)).toBe('/dashboard');
    expect(safeCallbackUrl(undefined)).toBe('/dashboard');
    expect(safeCallbackUrl('')).toBe('/dashboard');
  });

  it('rejects absolute URLs', () => {
    expect(safeCallbackUrl('https://evil.com')).toBe('/dashboard');
    expect(safeCallbackUrl('javascript:alert(1)')).toBe('/dashboard');
  });

  it('rejects protocol-relative URLs', () => {
    expect(safeCallbackUrl('//evil.com')).toBe('/dashboard');
    expect(safeCallbackUrl('//evil.com/path')).toBe('/dashboard');
  });

  it('rejects the backslash variant browsers normalise to //', () => {
    expect(safeCallbackUrl('/\\evil.com')).toBe('/dashboard');
  });

  it('rejects paths containing control characters', () => {
    expect(safeCallbackUrl('/dash\nboard')).toBe('/dashboard');
    expect(safeCallbackUrl('/dash\u0000board')).toBe('/dashboard');
    expect(safeCallbackUrl('/dash\tboard')).toBe('/dashboard');
  });

  it('honours a custom fallback', () => {
    expect(safeCallbackUrl('https://evil.com', '/home')).toBe('/home');
  });
});
