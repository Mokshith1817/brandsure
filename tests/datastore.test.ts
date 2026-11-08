import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isSupabaseConfigured,
  isDemoModeAllowed,
  getDataStoreStatus,
  assertCoreFlowAllowed,
} from '@/lib/data-store';

describe('Phase 1: Data Store Truth & Production Gates', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('proves: production without Supabase variables and demo mode disabled refuses to run core flow', () => {
    // Simulate production environment with missing Supabase credentials and disabled demo mode
    (process.env as any).NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.DEMO_MODE;
    process.env.DISABLE_DEMO_MODE = 'true';
    process.env.VERCEL = '1';

    expect(isSupabaseConfigured()).toBe(false);
    expect(isDemoModeAllowed()).toBe(false);

    const status = getDataStoreStatus();
    expect(status.canRunCoreFlow).toBe(false);
    expect(status.isConfigured).toBe(false);
    expect(status.isDemoMode).toBe(false);
    expect(status.errorMessage).toContain('Database not configured');

    expect(() => assertCoreFlowAllowed()).toThrowError(/Database not configured/);
  });

  it('proves: production with Supabase variables uses Supabase', () => {
    (process.env as any).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://paynest-production.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJh...production-anon-key';
    delete process.env.DEMO_MODE;

    expect(isSupabaseConfigured()).toBe(true);
    expect(isDemoModeAllowed()).toBe(false);

    const status = getDataStoreStatus();
    expect(status.mode).toBe('supabase');
    expect(status.isConfigured).toBe(true);
    expect(status.isDemoMode).toBe(false);
    expect(status.canRunCoreFlow).toBe(true);
    expect(status.footerLabel).toBe('Data store: Supabase');
    expect(status.bannerText).toBeNull();

    expect(() => assertCoreFlowAllowed()).not.toThrow();
  });

  it('proves: standalone demo mode is active by default when Supabase is not configured', () => {
    (process.env as any).NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.VERCEL;
    delete process.env.DISABLE_DEMO_MODE;

    expect(isSupabaseConfigured()).toBe(false);
    expect(isDemoModeAllowed()).toBe(true);

    const status = getDataStoreStatus();
    expect(status.mode).toBe('demo');
    expect(status.isDemoMode).toBe(true);
    expect(status.canRunCoreFlow).toBe(true);
    expect(status.footerLabel).toContain('PayNest');

    expect(() => assertCoreFlowAllowed()).not.toThrow();
  });

  it('proves: placeholder supabase URL is rejected as unconfigured', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-anon-key';

    expect(isSupabaseConfigured()).toBe(false);
  });
});
