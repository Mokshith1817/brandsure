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
import { formatDate } from '@/lib/utils';
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Share2,
  Mail,
  Megaphone,
  BookOpen,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { Channel } from '@/types/database';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Approvals Queue | BrandSure',
  description: 'Compliance Manager final approval checkpoint for marketing copy.',
};

const channelIcons: Record<Channel, React.ComponentType<{ className?: string }>> = {
  social: Share2,
  email: Mail,
  ad: Megaphone,
  blog: BookOpen,
};

export default async function ApprovalsQueuePage() {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!user || !profile) {
    redirect('/login');
  }

  // Restrict to Manager and Admin
  if (profile.role !== 'manager' && profile.role !== 'admin') {
    redirect('/drafts');
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

  const pendingDrafts = drafts.filter((d) => d.status === 'in_review' || d.status === 'checked');
  const decidedDrafts = drafts.filter((d) => d.status === 'approved' || d.status === 'rejected' || d.status === 'changes_requested');

  return (
    <AppLayout
      userEmail={user.email}
      fullName={profile.full_name}
      role={profile.role}
      orgName={profile.organisations?.name || 'PayNest'}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Compliance Approvals Queue
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Final gatekeeper authorization point. The AI Review Agent flags issues and suggests fixes, but <strong>only Compliance Managers decide</strong> whether to approve, reject, or request revisions.
          </p>
        </div>

        {/* Pending Decisions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Pending Manager Decision</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                {pendingDrafts.length}
              </span>
            </h2>
          </div>

          {pendingDrafts.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-sm text-slate-500 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>No drafts currently waiting for manager decision. All items are processed.</span>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Channel & Ver</th>
                      <th className="py-3 px-4">Draft Copy</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Violations Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pendingDrafts.map((draft) => {
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
                            <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                              {draft.snippet || 'Inspect draft to review content and citations.'}
                            </p>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-700">
                            <span className="font-semibold block">{draft.profiles?.full_name || 'Creator'}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{formatDate(draft.created_at)}</span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            {totalOpen === 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Zero Open Violations</span>
                              </span>
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
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                            >
                              <span>Inspect & Decide</span>
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

        {/* Recently Decided Section */}
        {decidedDrafts.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Decided & Published Drafts ({decidedDrafts.length})
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Draft & Channel</th>
                      <th className="py-3 px-4">Content Preview</th>
                      <th className="py-3 px-4">Final Verdict</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {decidedDrafts.map((draft) => (
                      <tr key={draft.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-xs font-semibold text-slate-800 capitalize">
                          {draft.channel} (v{draft.current_version})
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-md truncate">
                          {draft.snippet}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={draft.status} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/drafts/${draft.id}`}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            View Decision
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
