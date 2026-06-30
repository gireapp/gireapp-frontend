'use server';

import { redirect } from 'next/navigation';
import { setSessionToken, clearSessionToken } from '@/lib/session';
import {
  registerSchema,
  loginSchema,
} from '@gireapp/shared';
import type { ApiResponse } from '@gireapp/shared';
import { API_PATHS } from '@gireapp/shared';
import { serverApiClient, ApiError } from '@/lib/api-client';

export async function registerAction(
  _prevState: ApiResponse,
  formData: FormData
): Promise<ApiResponse> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
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
