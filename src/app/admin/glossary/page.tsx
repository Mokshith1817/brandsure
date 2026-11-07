import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { GlossaryClient } from './GlossaryClient';
import { getCurrentSession } from '@/lib/auth';
import { getDemoGlossary, isSupabaseConfigured } from '@/lib/demo-data';
import { DatabaseNotConfigured } from '@/components/ui/DatabaseNotConfigured';

export const dynamic = 'force-dynamic';

export default async function AdminGlossaryPage() {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return <DatabaseNotConfigured pageName="Brand Glossary Manager" />;
  }

  if (!user || profile?.role !== 'admin') {
    redirect('/login');
  }

  let entries: any[] = [];
  if (isDemoMode) {
    entries = getDemoGlossary();
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('glossary')
        .select('*')
        .order('preferred', { ascending: true });
      if (data && data.length > 0) {
        entries = data;
      }
    } catch (err: any) {
      console.error('[Supabase Glossary Query Error]:', err.message);
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand Glossary</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure preferred brand terms and their banned variations. Deterministic checks catch these instantly across all content drafts.
            </p>
          </div>
        </div>

        <GlossaryClient initialEntries={entries} />
      </div>
    </AppLayout>
  );
}
