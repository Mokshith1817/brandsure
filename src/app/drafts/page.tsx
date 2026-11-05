import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { getCurrentSession } from '@/lib/auth';
import { getDemoDrafts, isSupabaseConfigured } from '@/lib/demo-data';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { NextStepBanner } from '@/components/ui/NextStepBanner';
import { formatDate } from '@/lib/utils';
import {
  PlusCircle,
  FileText,
  Share2,
  Mail,
  Megaphone,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type { Channel, Draft } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Content Drafts | BrandSure',
  description: 'Marketing content drafts and pre-publication compliance review queue.',
};

const channelIcons: Record<Channel, React.ComponentType<{ className?: string }>> = {
  social: Share2,
  email: Mail,
  ad: Megaphone,
  blog: BookOpen,
};

export default async function DraftsListPage() {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!user || !profile) {
    redirect('/login');
  }

  let drafts: any[] = [];

  if (isSupabaseConfigured() && !isDemoMode) {
    try {
      const supabase = await createClient();
      const { data: rawDrafts } = await supabase
        .from('drafts')
        .select(`
          *,
          profiles:creator_id (full_name, role),
          draft_versions:draft_versions (id, version_no, body, findings:findings (id, severity, status))
        `)
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false });

      if (rawDrafts && rawDrafts.length > 0) {
        drafts = rawDrafts.map((d: any) => {
          const currentVer = d.draft_versions?.find((v: any) => v.version_no === d.current_version);
          const findings = currentVer?.findings || [];
          const openFindings = findings.filter((f: any) => f.status === 'open');

          return {
            ...d,
            snippet: currentVer?.body || '',
            finding_counts: {
              high: openFindings.filter((f: any) => f.severity === 'high').length,
              medium: openFindings.filter((f: any) => f.severity === 'medium').length,
              low: openFindings.filter((f: any) => f.severity === 'low').length,
            },
          };
        });
      }
    } catch {
      // Fallback
    }
  }

  if (drafts.length === 0) {
    drafts = getDemoDrafts();
  }

  return (
    <AppLayout
      userEmail={user.email}
      fullName={profile.full_name}
      role={profile.role}
      orgName={profile.organisations?.name || 'PayNest'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Drafts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Submit and govern marketing copy across channels. Every draft is checked against bounded brand guidelines.
            </p>
          </div>
          <Link
            href="/drafts/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Draft</span>
          </Link>
        </div>

        {/* Next Step Guidance Banner */}
        <NextStepBanner
          statusTitle="Submit a Draft for Compliance Review"
          explanation="Create new marketing copy across social, email, ad, or blog channels. The bounded review agent will verify claims against approved brand guidelines and facts."
          actionText="Create New Draft"
          actionHref="/drafts/new"
          variant="info"
        />

        {/* Drafts List Table */}
        {drafts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Drafts Created Yet"
            description="Submit your first marketing copy snippet to run automated brand and regulatory checks."
            actionLabel="Create New Draft"
            actionHref="/drafts/new"
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Channel & Version</th>
                    <th className="py-3 px-4">Content Preview</th>
                    <th className="py-3 px-4">Governance Status</th>
                    <th className="py-3 px-4">Open Violations</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {drafts.map((draft) => {
                    const ChannelIcon = channelIcons[draft.channel as Channel] || FileText;
                    const counts = draft.finding_counts || { high: 0, medium: 0, low: 0 };
                    const totalOpen = counts.high + counts.medium + counts.low;

                    return (
                      <tr key={draft.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                              <ChannelIcon className="w-4 h-4" />
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 capitalize block">
                                {draft.channel}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                v{draft.current_version}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 max-w-sm">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {draft.snippet || 'Click to view draft content and findings.'}
                          </p>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={draft.status} />
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {totalOpen === 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Clean & Compliant
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {counts.high > 0 && <SeverityBadge severity="high" count={counts.high} />}
                              {counts.medium > 0 && <SeverityBadge severity="medium" count={counts.medium} />}
                              {counts.low > 0 && <SeverityBadge severity="low" count={counts.low} />}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                          {formatDate(draft.created_at)}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/drafts/${draft.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
