import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuidelinesClient } from './GuidelinesClient';
import { getCurrentSession } from '@/lib/auth';
import { getDemoGuidelines, isSupabaseConfigured } from '@/lib/demo-data';
import { DatabaseNotConfigured } from '@/components/ui/DatabaseNotConfigured';

export const dynamic = 'force-dynamic';

export default async function AdminGuidelinesPage() {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return <DatabaseNotConfigured pageName="Admin Guidelines Manager" />;
  }

  if (!user || profile?.role !== 'admin') {
    redirect('/login');
  }

  let guidelines: any[] = [];
  if (isDemoMode) {
    guidelines = getDemoGuidelines();
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from('guidelines')
        .select('*, guideline_chunks(id, embedding)')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        guidelines = data;
      }
    } catch (err: any) {
      console.error('[Supabase Guidelines Query Error]:', err.message);
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand Guidelines</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage approved brand guidelines. Entries are chunked and indexed into vector search for review checks.
            </p>
          </div>
        </div>

        <GuidelinesClient initialGuidelines={guidelines} />
      </div>
    </AppLayout>
  );
}
