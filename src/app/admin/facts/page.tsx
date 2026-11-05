import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { FactsClient } from './FactsClient';

export const dynamic = 'force-dynamic';

export default async function AdminFactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organisations(name)')
    .eq('id', user.id)
    .single();

  const { data: facts } = await supabase
    .from('facts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AppLayout
      userEmail={user!.email!}
      fullName={profile?.full_name || 'Admin'}
      role={profile?.role || 'admin'}
      orgName={profile?.organisations?.name || 'PayNest'}
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

        <FactsClient initialFacts={facts || []} />
      </div>
    </AppLayout>
  );
}
