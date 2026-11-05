import React from 'react';
import { notFound, redirect } from 'next/navigation';
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

  if (!user || !profile) {
    redirect('/login');
  }

  let draft: Draft | null = null;
  let version: DraftVersion | null = null;
  let findings: Finding[] = [];
  let comments: any[] = [];
  let decisions: any[] = [];
  let allVersions: DraftVersion[] = [];

  if (isSupabaseConfigured() && !isDemoMode) {
    try {
      const supabase = await createClient();

      // Fetch draft
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
    } catch (err) {
      console.warn('[Live draft detail query error, falling back to demo store]:', err);
    }
  }

  // Fallback to in-memory demo drafts
  if (!draft || !version) {
    const demoDraftObj = getDemoDraftById(id);
    if (demoDraftObj) {
      draft = demoDraftObj.draft;
      version = demoDraftObj.version || null;
      findings = demoDraftObj.findings || [];
    }
  }

  if (comments.length === 0) {
    comments = getDemoComments(id);
  }

  if (decisions.length === 0) {
    decisions = getDemoDecisions(id);
  }

  if (allVersions.length === 0) {
    allVersions = getDemoDraftVersions(id);
  }

  if (!draft || !version) {
    notFound();
  }

  return (
    <AppLayout
      userEmail={user.email}
      fullName={profile.full_name}
      role={profile.role}
      orgName={profile.organisations?.name || 'PayNest'}
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
