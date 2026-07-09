'use server';

import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';
import { setSessionToken, clearSessionToken } from '@/lib/session';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  onboardingSchema,
} from '@gireapp/shared';
import type { ApiResponse, AcademicLevel } from '@gireapp/shared';
import { API_PATHS } from '@gireapp/shared';
import { serverApiClient, ApiError } from '@/lib/api-client';

const TRACK_TO_LEVEL: Record<string, AcademicLevel> = {
  Secondary: 'SECONDARY',
  Tertiary: 'TERTIARY',
  Professional: 'PROFESSIONAL',
};

// DEV MOCK: mint a local session so the signup → dashboard flow can be demoed
// without the backend. Active only when MOCK_AUTH=true (see .env.local).
async function createMockSession(data: { email: string; track?: string; department?: string }) {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-dev-secret-change-me');
  const token = await new SignJWT({
    userId: `mock-${Date.now()}`,
    role: 'STUDENT',
    email: data.email,
    academicLevel: TRACK_TO_LEVEL[data.track ?? ''] ?? 'SECONDARY',
    department: data.department ?? null,
    isOnboardingComplete: true,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(`mock-${data.email}`)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  await setSessionToken(token);
}

export async function registerAction(
  _prevState: ApiResponse,
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    track: formData.get('track') as string,
    department: formData.get('department') as string,
    level: formData.get('level') as string,
    focusArea: formData.get('focusArea') as string,
  };

  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await serverApiClient(API_PATHS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(result.data),
    });

    // Auto-login logic would go here if backend returns token.
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message, errors: error.fieldErrors };
    }
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function loginAction(
  _prevState: ApiResponse,
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };
  
  const rawCallbackUrl = formData.get('callbackUrl') as string | null;
  const callbackUrl = (rawCallbackUrl && rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//'))
    ? rawCallbackUrl
    : '/dashboard';

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { data } = await serverApiClient<{ token?: string; user?: any }>(API_PATHS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(result.data),
    });

    // We expect backend to set the HTTP-Only cookie, but if it returns a token in the body we can store it.
    // Wait, the backend in auth.controller.ts uses res.cookie(). 
    // BUT since frontend and backend are on different domains/ports in dev, we might need to handle tokens manually if CORS credentials don't work easily.
    // Actually, backend sets HTTP-Only cookie. If they are on the same domain in production it works.
    // If backend doesn't return the token in JSON body, we can't set it via setSessionToken.
    // Let's check backend auth.controller.ts: it does NOT return the token in JSON. Wait, it only sets the cookie.
    // So if the backend sets the cookie, the fetch client receives the set-cookie header.
    // We need to forward that Set-Cookie header to the client!
    // Since this is a server action, `apiClient` doesn't automatically forward Set-Cookie to the Next.js response.
    // We should get the token from the response headers or ask backend to return it.
    // For decoupled architecture, it's safer if backend returns token and Next.js sets it in its own cookies.
    // The previous frontend `actions.ts` expected `data.token`. So let's assume backend auth controller needs updating to return the token.
    // We will update backend auth controller later.
    
    if (data.token) {
       await setSessionToken(data.token);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message, errors: error.fieldErrors };
    }
    return { success: false, error: 'Network error. Please try again.' };
  }

  redirect(callbackUrl);
}

export async function logoutAction() {
  try {
    await serverApiClient(API_PATHS.AUTH.LOGOUT, { method: 'POST' });
  } catch (error) {}
  await clearSessionToken();
  redirect('/');
}

export async function forgotPasswordAction(
  _prevState: ApiResponse,
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    email: formData.get('email') as string,
  };

  const result = forgotPasswordSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await serverApiClient(API_PATHS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(result.data),
    });

    // Always return success to prevent email enumeration
    return { success: true };
  } catch (error) {
    // Still return success to prevent email enumeration
    return { success: true };
  }
}

export async function resetPasswordAction(
  _prevState: ApiResponse,
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    token: formData.get('token') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const result = resetPasswordSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await serverApiClient(API_PATHS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(result.data),
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message, errors: error.fieldErrors };
    }
    return { success: false, error: 'Failed to reset password. Please try again.' };
  }
}

export async function completeOnboardingAction(
  _prevState: ApiResponse,
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    academicLevel: formData.get('academicLevel') as string,
    department: formData.get('department') as string,
    moodTheme: formData.get('moodTheme') as string,
  };

  const result = onboardingSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { data } = await serverApiClient<{ token?: string }>(API_PATHS.AUTH.ONBOARDING, {
      method: 'POST',
      body: JSON.stringify(result.data),
    });

    // If backend returns an updated token (with onboarding flag set), refresh the session
    if (data.token) {
      await setSessionToken(data.token);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message, errors: error.fieldErrors };
    }
    return { success: false, error: 'Failed to save preferences. Please try again.' };
  }
}

export async function verifyEmailAction(token: string): Promise<ApiResponse> {
  try {
    const { data } = await serverApiClient<{ message?: string }>(API_PATHS.AUTH.VERIFY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Verification failed. The link may be invalid or expired.' };
  }
}
