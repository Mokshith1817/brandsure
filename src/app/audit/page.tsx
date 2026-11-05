import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuditLogClient } from './AuditLogClient';
import type { Role, AuditLogEntry } from '@/types/database';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Audit Log | BrandSure',
  description: 'Append-only audit trail of compliance reviews, agent runs, and managerial decisions.',
};

export const dynamic = 'force-dynamic';

export default async function AuditLogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organisations(name)')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  const role = profile.role as Role;
  const orgName = (profile.organisations as any)?.name || 'PayNest';

  // Only Admin and Manager are permitted to access full audit trail
  const isAuthorized = role === 'admin' || role === 'manager';

  if (!isAuthorized) {
    return (
      <AppLayout
        userEmail={user.email || ''}
        fullName={profile.full_name}
        role={role}
        orgName={orgName}
      >
        <div className="bg-white border border-amber-200 rounded-xl p-8 max-w-lg mx-auto text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Restricted Access</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            The governance audit log is restricted to <strong>Compliance Managers</strong> and <strong>Brand Administrators</strong>.
            As a <strong>{role}</strong>, you can view your draft findings and team comments on the Drafts page.
          </p>
          <Link
            href="/drafts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Drafts</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Fetch recent audit logs for the organization
  const { data: rawLogs } = await supabase
    .from('audit_log')
    .select(`
      *,
      profiles:actor_id (full_name)
    `)
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })
    .limit(100);

  const logs = (rawLogs || []).map((row: any) => ({
    id: row.id,
    org_id: row.org_id,
    actor_id: row.actor_id,
    actor_type: row.actor_type,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    detail: row.detail || {},
    created_at: row.created_at,
    actor_name: row.profiles?.full_name || (row.actor_type === 'ai_agent' ? 'BrandSure AI' : undefined),
  }));

  return (
    <AppLayout
      userEmail={user.email || ''}
      fullName={profile.full_name}
      role={role}
      orgName={orgName}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Governance Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cryptographically sealed, append-only record of all AI agent checks, creator dispositions, and managerial approvals.
          </p>
        </div>

        <AuditLogClient logs={logs} />
      </div>
    </AppLayout>
  );
}
