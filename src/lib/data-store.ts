export type DataStoreMode = 'supabase' | 'demo';

/**
 * Checks if Supabase credentials are configured with real (non-placeholder) credentials.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder.supabase.co') &&
    !key.includes('placeholder')
  );
}

/**
 * In-memory demo mode is allowed ONLY for local development when DEMO_MODE=true is explicitly set.
 * In production, it is NEVER allowed.
 */
export function isDemoModeAllowed(): boolean {
  const isExplicitDemo = process.env.DEMO_MODE === 'true';
  // If running in production (e.g. deployed on Vercel), in-memory demo mode is strictly disallowed.
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
    return false;
  }
  return isExplicitDemo;
}

/**
 * Evaluates the current operational status of the data store.
 */
export function getDataStoreStatus(): {
  mode: DataStoreMode;
  isConfigured: boolean;
  isDemoMode: boolean;
  canRunCoreFlow: boolean;
  bannerText: string | null;
  footerLabel: string;
  errorMessage: string | null;
} {
  const configured = isSupabaseConfigured();
  const demoAllowed = isDemoModeAllowed();

  if (configured) {
    return {
      mode: 'supabase',
      isConfigured: true,
      isDemoMode: false,
      canRunCoreFlow: true,
      bannerText: null,
      footerLabel: 'Data store: Supabase',
      errorMessage: null,
    };
  }

  if (demoAllowed) {
    return {
      mode: 'demo',
      isConfigured: false,
      isDemoMode: true,
      canRunCoreFlow: true,
      bannerText: 'Demo mode: data is temporary and resets',
      footerLabel: 'Data store: Demo mode (in-memory)',
      errorMessage: null,
    };
  }

  // Missing Supabase and Demo mode not permitted
  return {
    mode: 'supabase',
    isConfigured: false,
    isDemoMode: false,
    canRunCoreFlow: false,
    bannerText: null,
    footerLabel: 'Data store: Unconfigured',
    errorMessage: 'Database not configured: This environment requires live Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). In-memory fallback is disabled.',
  };
}

/**
 * Guard for server actions: throws an error or returns rejection if core flow is not permitted.
 */
export function assertCoreFlowAllowed(): void {
  const status = getDataStoreStatus();
  if (!status.canRunCoreFlow) {
    throw new Error(status.errorMessage || 'Database not configured');
  }
}
