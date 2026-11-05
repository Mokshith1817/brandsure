'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEMO_PROFILES, isSupabaseConfigured } from '@/lib/demo-data';
import { DEMO_COOKIE_NAME } from '@/lib/auth';
import type { Role } from '@/types/database';

export async function loginAction(email: string, password?: string) {
  const trimmedEmail = email.trim().toLowerCase();
  const cookieStore = await cookies();

  // 1. If Supabase is configured with real credentials, attempt live auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password || 'PayNest2026!',
      });

      if (!error && data?.user) {
        return { success: true, redirect: '/' };
      }
      // If error but it's a demo account, we gracefully fall through to demo session
      if (!DEMO_PROFILES[trimmedEmail]) {
        return { error: error?.message || 'Invalid email or password.' };
      }
    } catch (err: any) {
      console.warn('[Supabase Login Warning]:', err.message);
    }
  }

  // 2. Demo Account Login (Zero setup fallback)
  const demoProfile = DEMO_PROFILES[trimmedEmail];
  if (!demoProfile) {
    // If unknown email in demo mode, allow default creator role
    const defaultRole: Role = 'creator';
    const payload = {
      email: trimmedEmail,
      role: defaultRole,
      full_name: trimmedEmail.split('@')[0],
    };
    cookieStore.set(DEMO_COOKIE_NAME, JSON.stringify(payload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true, redirect: '/' };
  }

  // Set demo session cookie
  const payload = {
    email: trimmedEmail,
    role: demoProfile.role,
    full_name: demoProfile.full_name,
  };

  cookieStore.set(DEMO_COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, redirect: '/' };
}

export async function logoutAction() {
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
