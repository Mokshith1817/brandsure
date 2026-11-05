import { cookies } from 'next/headers';
import { createClient } from './supabase/server';
import { DEMO_PROFILES, DEMO_ORG, isSupabaseConfigured } from './demo-data';
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

  // 2. Fallback to Demo Cookie session
  const demoCookie = cookieStore.get(DEMO_COOKIE_NAME)?.value;
  if (demoCookie) {
    try {
      const parsed = JSON.parse(demoCookie);
      const email = parsed.email || 'admin@paynest.demo';
      const role = (parsed.role || 'admin') as Role;
      const fullName = parsed.full_name || DEMO_PROFILES[email]?.full_name || 'PayNest Demo User';

      return {
        user: {
          id: `demo-${role}`,
          email,
        },
        profile: {
          id: `demo-${role}`,
          org_id: DEMO_ORG.id,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
          organisations: { name: DEMO_ORG.name },
        },
        isDemoMode: true,
      };
    } catch {
      // Invalid cookie, proceed
    }
  }

  return {
    user: null,
    profile: null,
    isDemoMode: !configured,
  };
}
