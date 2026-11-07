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

  it('proves: production without Supabase variables refuses to run core flow', () => {
    // Simulate production environment with missing Supabase credentials
    (process.env as any).NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.DEMO_MODE;
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

  it('proves: local development permits demo mode ONLY when DEMO_MODE=true is set', () => {
    (process.env as any).NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.VERCEL;

    // 1. Without DEMO_MODE=true, demo mode is disabled
    delete process.env.DEMO_MODE;
    expect(isDemoModeAllowed()).toBe(false);
    expect(getDataStoreStatus().canRunCoreFlow).toBe(false);

    // 2. With DEMO_MODE=true, demo mode is active with banner and label
    process.env.DEMO_MODE = 'true';
    expect(isDemoModeAllowed()).toBe(true);

    const status = getDataStoreStatus();
    expect(status.mode).toBe('demo');
    expect(status.isDemoMode).toBe(true);
    expect(status.canRunCoreFlow).toBe(true);
    expect(status.bannerText).toBe('Demo mode: data is temporary and resets');
    expect(status.footerLabel).toBe('Data store: Demo mode (in-memory)');

    expect(() => assertCoreFlowAllowed()).not.toThrow();
  });

  it('proves: placeholder supabase URL is rejected as unconfigured', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-anon-key';

    expect(isSupabaseConfigured()).toBe(false);
  });
});
