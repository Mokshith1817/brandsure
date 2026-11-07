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
import { CheckSquare, ArrowRight, Share2, Mail, Megaphone, BookOpen, FileText } from 'lucide-react';
import type { Channel } from '@/types/database';

import { DatabaseNotConfigured } from '@/components/ui/DatabaseNotConfigured';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Review Queue | BrandSure',
  description: 'Team review queue for submitted marketing content drafts.',
};

const channelIcons: Record<Channel, React.ComponentType<{ className?: string }>> = {
  social: Share2,
  email: Mail,
  ad: Megaphone,
  blog: BookOpen,
};

export default async function ReviewQueuePage() {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return <DatabaseNotConfigured pageName="Review Queue" />;
  }

  if (!user || !profile) {
    redirect('/login');
  }

  let drafts: any[] = [];

  if (isDemoMode) {
    drafts = getDemoDrafts();
  } else {
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
    } catch (err: any) {
      console.error('[Supabase Reviews Query Error]:', err.message);
    }
  }

  // Filter for drafts that need review (in_review or checked)
  const queueDrafts = drafts.filter(
    (d) => d.status === 'in_review' || d.status === 'checked' || d.status === 'changes_requested'
  );

  return (
    <AppLayout
      userEmail={user.email}
      fullName={profile.full_name}
      role={profile.role}
      orgName={profile.organisations?.name || 'PayNest'}
      isDemoMode={isDemoMode}
    >
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Team Review Queue
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review marketing copy submitted by creators. Inspect AI findings, verify creator dispositions, and leave feedback comments.
          </p>
        </div>

        {/* Next Step Guidance Banner */}
        <NextStepBanner
          statusTitle="Inspect Submitted Drafts & Leave Feedback"
          explanation="Select any draft in the queue to examine flagged content, verify creator dispositions, check version diffs, and leave editorial commentary."
          actionText="Inspect First Queue Item"
          actionHref={queueDrafts[0] ? `/drafts/${queueDrafts[0].id}` : '/drafts'}
          variant="info"
        />

        {queueDrafts.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Review Queue is Empty"
            description="All submitted drafts have been reviewed or approved. When creators submit new drafts, they will appear here."
            actionLabel="View All Drafts"
            actionHref="/drafts"
          />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Draft & Channel</th>
                    <th className="py-3 px-4">Content Preview</th>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Open Findings</th>
                    <th className="py-3 px-4 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {queueDrafts.map((draft) => {
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
                            {draft.snippet || 'Click to view draft content.'}
                          </p>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-700">
                          <span className="font-semibold block">{draft.profiles?.full_name || 'Creator'}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{formatDate(draft.created_at)}</span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <StatusBadge status={draft.status} />
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {totalOpen === 0 ? (
                            <span className="text-xs text-emerald-700 font-medium">0 Open Violations</span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {counts.high > 0 && <SeverityBadge severity="high" count={counts.high} />}
                              {counts.medium > 0 && <SeverityBadge severity="medium" count={counts.medium} />}
                              {counts.low > 0 && <SeverityBadge severity="low" count={counts.low} />}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/drafts/${draft.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                          >
                            <span>Open Review</span>
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
