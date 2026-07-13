// ─────────────────────────────────────────────────
// GIREAPP — Session Management
// JWT-based session handling for the frontend
// ─────────────────────────────────────────────────

import { cookies } from 'next/headers';
import * as jose from 'jose';
import type { JwtPayload } from '@gireapp/shared';
import { JWT_SECRET } from '@/lib/auth-secret';

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch (error) {
    return null;
  }
}

export async function setSessionToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function clearSessionToken() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
