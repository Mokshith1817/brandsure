import { cookies } from 'next/headers';
import { createClient } from './supabase/server';
import { DEMO_PROFILES, DEMO_ORG, isSupabaseConfigured, isDemoModeAllowed } from './demo-data';
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

export async function getCurrentSession(): Promise<UserSession> {
  const cookieStore = await cookies();
  const configured = isSupabaseConfigured();

  // 1. Try real Supabase auth if configured
  if (configured) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
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

  // 2. Demo Cookie session (strictly cryptographically signed and verified)
  if (isDemoModeAllowed()) {
    const rawToken = cookieStore.get(DEMO_COOKIE_NAME)?.value;
    if (rawToken) {
      const verified = await verifySignedSessionCookie(rawToken);
      if (verified) {
        const userId =
          verified.userId ||
          (verified.email === 'creator@paynest.demo'
            ? 'demo-creator'
            : verified.email === 'reviewer@paynest.demo'
            ? 'demo-reviewer'
            : verified.email === 'manager@paynest.demo'
            ? 'demo-manager'
            : verified.email === 'admin@paynest.demo'
            ? 'demo-admin'
            : `demo-${verified.email.split('@')[0]}`);

        return {
          user: {
            id: userId,
            email: verified.email,
          },
          profile: {
            id: userId,
            org_id: verified.org_id,
            full_name: verified.full_name,
            role: verified.role,
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
