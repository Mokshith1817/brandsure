import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlossaryClient } from './GlossaryClient';

export const dynamic = 'force-dynamic';

export default async function AdminGlossaryPage() {
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

  const { data: entries } = await supabase
    .from('glossary')
    .select('*')
    .order('preferred', { ascending: true });

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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand Glossary</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure preferred brand terms and their banned variations. Deterministic checks catch these instantly across all content drafts.
            </p>
          </div>
        </div>

        <GlossaryClient initialEntries={entries || []} />
      </div>
    </AppLayout>
  );
}
