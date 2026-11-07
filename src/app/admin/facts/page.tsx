import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { FactsClient } from './FactsClient';
import { getCurrentSession } from '@/lib/auth';
import { getDemoFacts, isSupabaseConfigured } from '@/lib/demo-data';
import { DatabaseNotConfigured } from '@/components/ui/DatabaseNotConfigured';

export const dynamic = 'force-dynamic';

export default async function AdminFactsPage() {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return <DatabaseNotConfigured pageName="Admin Facts Manager" />;
  }

  if (!user || profile?.role !== 'admin') {
    redirect('/login');
  }

  let facts: any[] = [];
  if (isDemoMode) {
    facts = getDemoFacts();
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('facts')
        .select('*')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        facts = data;
      }
    } catch (err: any) {
      console.error('[Supabase Facts Query Error]:', err.message);
    }
  }

  return (
    <AppLayout
      userEmail={user.email}
      fullName={profile.full_name}
      role={profile.role}
      orgName={profile.organisations?.name || 'PayNest'}
      isDemoMode={isDemoMode}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Approved Facts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Deterministic source-of-truth facts (fees, rates, user counts, performance numbers). Checks use exact lookup to prevent hallucinated numbers.
            </p>
          </div>
        </div>

        <FactsClient initialFacts={facts} />
      </div>
    </AppLayout>
  );
}
