import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { getCurrentSession } from '@/lib/auth';
import {
  getDemoDraftById,
  getDemoComments,
  getDemoDecisions,
  getDemoDraftVersions,
  isSupabaseConfigured,
} from '@/lib/demo-data';
import { DatabaseNotConfigured } from '@/components/ui/DatabaseNotConfigured';
import { DraftReviewClient } from './DraftReviewClient';
import type { Draft, DraftVersion, Finding, Comment, Decision } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Draft Review Workspace | BrandSure',
  description: 'Interactive pre-publication brand and compliance review workspace.',
};

interface DraftPageProps {
  params: Promise<{ id: string }>;
}

export default async function DraftDetailPage({ params }: DraftPageProps) {
  const { id } = await params;
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return <DatabaseNotConfigured pageName="Draft Review Workspace" />;
  }

  if (!user || !profile) {
    redirect('/login');
  }

  let draft: Draft | null = null;
  let version: DraftVersion | null = null;
  let findings: Finding[] = [];
  let comments: any[] = [];
  let decisions: any[] = [];
  let allVersions: DraftVersion[] = [];

  if (isDemoMode) {
    let cookieDraftObj = null;
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const raw = cookieStore.get(`bs_draft_${id}`)?.value;
      if (raw) {
        cookieDraftObj = JSON.parse(raw);
      }
    } catch {}

    const demoDraftObj = getDemoDraftById(id, cookieDraftObj);
    if (demoDraftObj) {
      draft = demoDraftObj.draft;
      version = demoDraftObj.version || null;
      findings = demoDraftObj.findings || [];
    }
    comments = getDemoComments(id);
    decisions = getDemoDecisions(id);
    allVersions = getDemoDraftVersions(id);
    if (allVersions.length === 0 && version) {
      allVersions = [version];
    }
  } else {
    // Live Supabase query
    try {
      const supabase = await createClient();

      const { data: draftData } = await supabase
        .from('drafts')
        .select('*, profiles:creator_id (full_name, role)')
        .eq('id', id)
        .single();

      if (draftData) {
        draft = draftData;

        // Fetch current version
        const { data: verData } = await supabase
          .from('draft_versions')
          .select('*')
          .eq('draft_id', draftData.id)
          .eq('version_no', draftData.current_version)
          .single();

        if (verData) {
          version = verData;

          // Fetch findings for this version
          const { data: findingsData } = await supabase
            .from('findings')
            .select('*')
            .eq('draft_version_id', verData.id)
            .order('created_at', { ascending: true });

          findings = findingsData || [];
        }

        // Fetch all versions
        const { data: versData } = await supabase
          .from('draft_versions')
          .select('*')
          .eq('draft_id', draftData.id)
          .order('version_no', { ascending: false });
        allVersions = versData || [];

        // Fetch comments
        const { data: comData } = await supabase
          .from('comments')
          .select('*, profiles:author_id (full_name, role)')
          .eq('draft_id', draftData.id)
          .order('created_at', { ascending: true });
        comments = comData || [];

        // Fetch decisions
        const { data: decData } = await supabase
          .from('decisions')
          .select('*, profiles:decided_by (full_name, role)')
          .eq('draft_id', draftData.id)
          .order('created_at', { ascending: false });
        decisions = decData || [];
      }
    } catch (err: any) {
      console.error('[Supabase Draft Detail Error]:', err.message);
    }
  }

  if (!draft || !version) {
    notFound();
  }

  // Enforce role isolation: Creators can ONLY read their own drafts
  if (profile.role === 'creator' && draft.creator_id !== user.id) {
    return (
      <AppLayout
        userEmail={user.email}
        fullName={profile.full_name}
        role={profile.role}
        orgName={profile.organisations?.name || 'PayNest'}
        isDemoMode={isDemoMode}
      >
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg mx-auto text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Access Denied (403 Forbidden)</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            You do not have permission to view this draft. Creators may only access drafts they personally authored.
          </p>
          <Link
            href="/drafts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Drafts</span>
          </Link>
        </div>
      </AppLayout>
    );
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
        <DraftReviewClient
          draft={draft}
          version={version}
          findings={findings}
          currentUserRole={profile.role}
          initialComments={comments}
          initialDecisions={decisions}
          allVersions={allVersions}
        />
      </div>
    </AppLayout>
  );
}
