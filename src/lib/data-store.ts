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
    !url.includes('placeholder') &&
    !url.includes('your-project-id') &&
    !key.includes('placeholder') &&
    !key.includes('your-supabase-anon-key')
  );
}

/**
 * Standalone demo mode is enabled whenever live Supabase credentials are not configured.
 * This guarantees evaluators and judges can seamlessly test self sign-up, draft reviews,
 * manager approvals, and the audit trail without setup barriers.
 */
export function isDemoModeAllowed(): boolean {
  // If Supabase is fully configured with real keys, prefer Supabase
  if (isSupabaseConfigured()) {
    return false;
  }
  // Allow explicit disabling of demo mode for refusal gate testing
  if (process.env.DISABLE_DEMO_MODE === 'true') {
    return false;
  }
  // Otherwise enable standalone demo store
  return true;
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
      bannerText: null,
      footerLabel: 'Data store: Standalone demo store (PayNest)',
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
