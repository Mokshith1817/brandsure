import { cookies } from 'next/headers';
import { createClient } from './supabase/server';
import { DEMO_PROFILES, DEMO_ORG } from './demo-data';
import { isSupabaseConfigured, isDemoModeAllowed } from './data-store';
import { verifySignedSessionCookie } from './session';
import type { Role, Profile } from '@/types/database';

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
  profile: (Profile & { organisations?: { name: string } }) | null;
  isDemoMode: boolean;
}

export const DEMO_COOKIE_NAME = 'brandsure_demo_session';

/**
 * Gets the current authenticated session.
 * Roles are read ONLY from the server-side database (profiles table in Supabase,
 * or server-side demo profile mapping in development demo mode).
 * Roles are NEVER read from cookies or client request payloads.
 */
export async function getCurrentSession(): Promise<UserSession> {
  const configured = isSupabaseConfigured();

  // 1. Real Supabase Auth (mandatory in production)
  if (configured) {
    try {
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (user && !userError) {
        // Read role ONLY from profiles table on the server
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, organisations(name)')
          .eq('id', user.id)
          .single();

        if (profile) {
          return {
            user: { id: user.id, email: user.email || '' },
            profile,
            isDemoMode: false,
          };
        }
      }
    } catch (err) {
      console.warn('[Supabase Auth Warning]:', err);
    }
  }

  // 2. Demo Cookie session (strictly in development when DEMO_MODE=true)
  if (isDemoModeAllowed()) {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(DEMO_COOKIE_NAME)?.value;
    if (rawToken) {
      const verified = await verifySignedSessionCookie(rawToken);
      if (verified) {
        // Read role ONLY on the server from server ground truth, NEVER from cookie
        const demoProfile = DEMO_PROFILES[verified.email];
        const role: Role = demoProfile ? demoProfile.role : 'creator';
        const fullName = demoProfile ? demoProfile.full_name : verified.full_name || verified.email.split('@')[0];

        return {
          user: {
            id: verified.userId,
            email: verified.email,
          },
          profile: {
            id: verified.userId,
            org_id: verified.org_id,
            full_name: fullName,
            role,
            created_at: new Date().toISOString(),
            organisations: { name: DEMO_ORG.name },
          },
          isDemoMode: true,
        };
      }
    }
  }

  return {
    user: null,
    profile: null,
    isDemoMode: isDemoModeAllowed(),
  };
}
