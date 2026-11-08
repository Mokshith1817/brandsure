'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEMO_PROFILES, DEMO_ORG } from '@/lib/demo-data';
import { isSupabaseConfigured, isDemoModeAllowed } from '@/lib/data-store';
import { DEMO_COOKIE_NAME } from '@/lib/auth';
import { createSignedSessionCookie } from '@/lib/session';
import type { Role } from '@/types/database';

function getRedirectForRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/rules';
    case 'manager':
      return '/approvals';
    case 'reviewer':
      return '/reviews';
    case 'creator':
    default:
      return '/drafts';
  }
}

/**
 * Real email and password sign in via Supabase Auth (or demo mode in development).
 * Roles are resolved strictly on the server from the profiles table.
 */
export async function signInAction(emailInput: string, passwordInput?: string) {
  const trimmedEmail = (emailInput || '').trim().toLowerCase();
  const password = passwordInput || '';

  if (!trimmedEmail || !password) {
    return { error: 'Please enter both your email address and password.' };
  }

  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    // Running in unit test runner outside Next.js request context
  }

  // 1. Production / Real Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error || !data?.user) {
        return { error: error?.message || 'Invalid email or password.' };
      }

      // Read role ONLY from profiles table on the server
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = profile?.role || 'creator';
      return { success: true, redirect: getRedirectForRole(role) };
    } catch (err: any) {
      console.warn('[Supabase Login Warning]:', err.message);
      return { error: err.message || 'Authentication service error.' };
    }
  }

  // 2. Demo Mode Login (Local development only when DEMO_MODE=true)
  if (isDemoModeAllowed()) {
    const demoProfile = DEMO_PROFILES[trimmedEmail];
    if (!demoProfile && password !== 'PayNest2026!') {
      return { error: 'Invalid email or password.' };
    }

    const userId =
      trimmedEmail === 'creator@paynest.demo'
        ? 'demo-creator'
        : trimmedEmail === 'reviewer@paynest.demo'
        ? 'demo-reviewer'
        : trimmedEmail === 'manager@paynest.demo'
        ? 'demo-manager'
        : trimmedEmail === 'admin@paynest.demo'
        ? 'demo-admin'
        : `demo-${trimmedEmail.split('@')[0]}`;

    const fullName = demoProfile ? demoProfile.full_name : trimmedEmail.split('@')[0];
    const role: Role = demoProfile ? demoProfile.role : 'creator';

    // Cookie carries ONLY identity, NEVER a role
    const signedToken = await createSignedSessionCookie({
      userId,
      email: trimmedEmail,
      full_name: fullName,
      org_id: DEMO_ORG.id,
    });

    if (cookieStore) {
      cookieStore.set(DEMO_COOKIE_NAME, signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return { success: true, redirect: getRedirectForRole(role) };
  }

  return { error: 'Database not configured. Live Supabase credentials are required in production.' };
}

// Alias for backwards compatibility
export const loginAction = signInAction;

/**
 * Self sign-up action.
 * Creates user in Supabase Auth and strictly assigns role 'creator' in PayNest org.
 * Client CANNOT choose role or organization.
 */
export async function signUpAction(params: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string; // Intentionally ignored/overridden to prevent privilege escalation
}) {
  const fullName = (params.fullName || '').trim();
  const trimmedEmail = (params.email || '').trim().toLowerCase();
  const password = params.password || '';
  const confirmPassword = params.confirmPassword || '';

  if (!fullName) {
    return { error: 'Full name is required.' };
  }
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { error: 'A valid email address is required.' };
  }
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' };
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  // 1. Production / Real Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('unique') ||
          error.status === 422
        ) {
          return { error: 'This email is already registered. Please sign in instead.' };
        }
        return { error: error.message };
      }

      if (data?.user) {
        // Query PayNest org id
        const { data: org } = await supabase
          .from('organisations')
          .select('id')
          .eq('name', 'PayNest')
          .maybeSingle();

        const orgId = org?.id || '00000000-0000-0000-0000-000000000001';

        // Server strictly assigns role 'creator' - ignoring any client-passed role parameter
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            org_id: orgId,
            full_name: fullName,
            role: 'creator', // Strictly 'creator'
          },
          { onConflict: 'id' }
        );
      }

      return { success: true, redirect: '/drafts' };
    } catch (err: any) {
      console.warn('[Supabase SignUp Warning]:', err.message);
      return { error: err.message || 'Failed to complete registration.' };
    }
  }

  // 2. Demo mode sign up (development only)
  if (isDemoModeAllowed()) {
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      // Running in unit test runner outside Next.js request context
    }

    const userId = `demo-${trimmedEmail.split('@')[0]}-${Date.now()}`;

    // Add to demo profiles strictly as creator
    DEMO_PROFILES[trimmedEmail] = {
      role: 'creator',
      full_name: fullName,
    };

    const signedToken = await createSignedSessionCookie({
      userId,
      email: trimmedEmail,
      full_name: fullName,
      org_id: DEMO_ORG.id,
    });

    if (cookieStore) {
      cookieStore.set(DEMO_COOKIE_NAME, signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return { success: true, redirect: '/drafts' };
  }

  return { error: 'Database not configured. Live Supabase credentials are required in production.' };
}

/**
 * Sign out action: Clears Supabase session and local demo cookies.
 */
export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE_NAME);

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }

  redirect('/login');
}

// Alias for backwards compatibility with TopBar
export const logoutAction = signOutAction;
