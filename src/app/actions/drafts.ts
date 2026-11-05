'use server';

import { getCurrentSession } from '@/lib/auth';
import { runReviewAgent } from '@/lib/agent';
import { createClient } from '@/lib/supabase/server';
import { writeAudit } from '@/lib/audit';
import {
  isSupabaseConfigured,
  createDemoDraft,
  updateDemoFindingStatus,
  updateDemoDraftBody,
  updateDemoDraftStatus,
  addDemoAuditLog,
} from '@/lib/demo-data';
import type { Channel, FindingStatus, DraftStatus } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function createDraft(formData: { channel: Channel; text: string }) {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!user || !profile) {
    return { error: 'Please log in to submit a draft.' };
  }

  const text = formData.text.trim();
  const channel = formData.channel;

  if (!text) {
    return { error: 'Draft content cannot be empty.' };
  }

  // 1. Run the Review Agent
  const agentResult = await runReviewAgent(text, channel, profile.org_id);

  // 2. Persist Draft, Version, and Findings
  if (isSupabaseConfigured() && !isDemoMode) {
    try {
      const supabase = await createClient();

      // Insert Draft
      const { data: draft, error: draftError } = await supabase
        .from('drafts')
        .insert({
          org_id: profile.org_id,
          creator_id: user.id,
          channel,
          status: 'checked',
          current_version: 1,
        })
        .select('id')
        .single();

      if (draftError || !draft) {
        return { error: draftError?.message || 'Failed to create draft.' };
      }

      // Insert Version 1
      const { data: version, error: verError } = await supabase
        .from('draft_versions')
        .insert({
          draft_id: draft.id,
          version_no: 1,
          body: text,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (verError || !version) {
        return { error: verError?.message || 'Failed to save draft version.' };
      }

      // Insert Findings
      if (agentResult.findings.length > 0) {
        const findingInserts = agentResult.findings.map((f) => ({
          draft_version_id: version.id,
          category: f.category,
          severity: f.severity,
          span_text: f.span_text,
          reason: f.reason,
          source_type: f.source_type,
          source_id: f.source_id,
          source_excerpt: f.source_excerpt,
          suggested_fix: f.suggested_fix,
          status: 'open',
          ai_generated: true,
        }));

        await supabase.from('findings').insert(findingInserts);
      }

      // Record Agent Run trace
      await supabase.from('agent_runs').insert({
        draft_version_id: version.id,
        status: 'done',
        steps: agentResult.steps,
        tool_call_count: agentResult.tool_call_count,
        finished_at: new Date().toISOString(),
      });

      // Audit Log
      await writeAudit(
        { id: user.id, type: 'user', org_id: profile.org_id },
        'draft_created',
        { type: 'draft', id: draft.id },
        { channel, length: text.length, findings_count: agentResult.findings.length }
      );

      await writeAudit(
        { id: null, type: 'ai_agent', org_id: profile.org_id },
        'draft_checked',
        { type: 'draft_version', id: version.id },
        {
          findings_count: agentResult.findings.length,
          tool_calls: agentResult.tool_call_count,
          duration_ms: agentResult.duration_ms,
        }
      );

      revalidatePath('/drafts');
      return { success: true, draftId: draft.id };
    } catch (err: any) {
      console.warn('[Live Draft Creation Error, falling back to demo store]:', err.message);
    }
  }

  // Demo / Offline Mode Persistence
  const demoResult = createDemoDraft({
    channel,
    text,
    creatorId: user.id,
    creatorName: profile.full_name,
    findings: agentResult.findings,
  });

  addDemoAuditLog({
    action: 'draft_created',
    actor_id: user.id,
    actor_type: 'user',
    actor_name: profile.full_name,
    entity_type: 'draft',
    entity_id: demoResult.draftId,
    detail: { channel, length: text.length, findings_count: agentResult.findings.length },
  });

  addDemoAuditLog({
    action: 'draft_checked',
    actor_id: null,
    actor_type: 'ai_agent',
    actor_name: 'BrandSure AI Review Agent',
    entity_type: 'draft_version',
    entity_id: demoResult.versionId,
    detail: {
      findings_count: agentResult.findings.length,
      tool_calls: agentResult.tool_call_count,
      duration_ms: agentResult.duration_ms,
    },
  });

  revalidatePath('/drafts');
  return { success: true, draftId: demoResult.draftId };
}

export async function updateFindingDisposition(params: {
  draftId: string;
  findingId: string;
  status: FindingStatus;
  decisionReason?: string;
  currentBody?: string;
  spanText?: string;
  replacementText?: string;
}) {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!user || !profile) {
    return { error: 'Unauthorized.' };
  }

  if (params.status === 'dismissed' && (!params.decisionReason || params.decisionReason.trim().length === 0)) {
    return { error: 'A written reason is required when dismissing a compliance finding.' };
  }

  // 1. Live Supabase update
  if (isSupabaseConfigured() && !isDemoMode) {
    try {
      const supabase = await createClient();

      // Update finding record
      const { error: findErr } = await supabase
        .from('findings')
        .update({
          status: params.status,
          decision_reason: params.decisionReason?.trim() || null,
          decided_by: user.id,
          decided_at: new Date().toISOString(),
        })
        .eq('id', params.findingId);

      if (findErr) return { error: findErr.message };

      // If accepted or edited with replacement text, update the draft version body
      if (
        (params.status === 'accepted' || params.status === 'edited') &&
        params.currentBody &&
        params.spanText &&
        params.replacementText
      ) {
        const updatedBody = params.currentBody.replace(params.spanText, params.replacementText);

        const { data: currentVer } = await supabase
          .from('drafts')
          .select('current_version')
          .eq('id', params.draftId)
          .single();

        if (currentVer) {
          await supabase
            .from('draft_versions')
            .update({ body: updatedBody })
            .eq('draft_id', params.draftId)
            .eq('version_no', currentVer.current_version);
        }
      }

      await writeAudit(
        { id: user.id, type: 'user', org_id: profile.org_id },
        `finding_${params.status}`,
        { type: 'finding', id: params.findingId },
        {
          draft_id: params.draftId,
          decision_reason: params.decisionReason || null,
          applied_fix: params.replacementText || null,
        }
      );

      revalidatePath(`/drafts/${params.draftId}`);
      revalidatePath('/drafts');
      return { success: true };
    } catch (err: any) {
      console.warn('[Live finding update failed, falling back]:', err.message);
    }
  }

  // 2. Demo Mode Update
  updateDemoFindingStatus(
    params.findingId,
    params.status,
    params.decisionReason,
    profile.full_name
  );

  if (
    (params.status === 'accepted' || params.status === 'edited') &&
    params.currentBody &&
    params.spanText &&
    params.replacementText
  ) {
    const updatedBody = params.currentBody.replace(params.spanText, params.replacementText);
    updateDemoDraftBody(params.draftId, updatedBody);
  }

  addDemoAuditLog({
    action: `finding_${params.status}`,
    actor_id: user.id,
    actor_type: 'user',
    actor_name: profile.full_name,
    entity_type: 'finding',
    entity_id: params.findingId,
    detail: {
      draft_id: params.draftId,
      status: params.status,
      decision_reason: params.decisionReason || null,
      applied_fix: params.replacementText || null,
    },
  });

  revalidatePath(`/drafts/${params.draftId}`);
  revalidatePath('/drafts');
  return { success: true };
}

export async function submitDraftForReview(draftId: string) {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!user || !profile) {
    return { error: 'Unauthorized.' };
  }

  if (isSupabaseConfigured() && !isDemoMode) {
    try {
      const supabase = await createClient();
      await supabase
        .from('drafts')
        .update({ status: 'in_review' })
        .eq('id', draftId);

      await writeAudit(
        { id: user.id, type: 'user', org_id: profile.org_id },
        'draft_submitted_for_review',
        { type: 'draft', id: draftId },
        {}
      );

      revalidatePath(`/drafts/${draftId}`);
      revalidatePath('/drafts');
      return { success: true };
    } catch {
      // Fallback
    }
  }

  updateDemoDraftStatus(draftId, 'in_review');

  addDemoAuditLog({
    action: 'draft_submitted_for_review',
    actor_id: user.id,
    actor_type: 'user',
    actor_name: profile.full_name,
    entity_type: 'draft',
    entity_id: draftId,
    detail: { status: 'in_review' },
  });

  revalidatePath(`/drafts/${draftId}`);
  revalidatePath('/drafts');
  return { success: true };
}
