'use server';

import { getCurrentSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { writeAudit } from '@/lib/audit';
import { runReviewAgent } from '@/lib/agent';
import {
  isSupabaseConfigured,
  addDemoComment,
  recordDemoDecision,
  createDemoDraftVersion,
  addDemoAuditLog,
  getDemoDraftById,
} from '@/lib/demo-data';
import { revalidatePath } from 'next/cache';

export async function addComment(draftId: string, body: string) {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return { error: 'Database not configured. Production requires a live Supabase connection.' };
  }

  if (!user || !profile) {
    return { error: 'Please log in to comment.' };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { error: 'Comment body cannot be empty.' };
  }

  if (!isDemoMode) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('comments')
        .insert({
          draft_id: draftId,
          author_id: user.id,
          body: trimmed,
        })
        .select('id')
        .single();

      if (error) return { error: `Database error: ${error.message}` };

      await writeAudit(
        { id: user.id, type: 'user', org_id: profile.org_id },
        'comment_added',
        { type: 'comment', id: data.id },
        { draft_id: draftId, author_role: profile.role }
      );

      revalidatePath(`/drafts/${draftId}`);
      revalidatePath('/reviews');
      revalidatePath('/approvals');
      return { success: true };
    } catch (err: any) {
      console.error('[Supabase Comment Insert Error]:', err.message);
      return { error: `Database error: ${err.message || 'Failed to post comment.'}` };
    }
  }

  // Demo store (Only reached when isDemoMode === true)
  addDemoComment({
    draftId,
    authorId: user.id,
    authorName: profile.full_name,
    authorRole: profile.role,
    body: trimmed,
  });

  addDemoAuditLog({
    action: 'comment_added',
    actor_id: user.id,
    actor_type: 'user',
    actor_name: profile.full_name,
    entity_type: 'draft',
    entity_id: draftId,
    detail: { author_role: profile.role, comment: trimmed.slice(0, 50) },
  });

  revalidatePath(`/drafts/${draftId}`);
  revalidatePath('/reviews');
  revalidatePath('/approvals');
  return { success: true };
}

export async function recordDecision(
  draftId: string,
  decision: 'approved' | 'rejected' | 'changes_requested',
  reason: string
) {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return { error: 'Database not configured. Production requires a live Supabase connection.' };
  }

  if (!user || !profile) {
    return { error: 'Please log in to record a decision.' };
  }

  if (profile.role !== 'manager' && profile.role !== 'admin') {
    return { error: 'Forbidden: Only Compliance Managers and Admins can record final decisions.' };
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { error: 'A mandatory written justification is required for every managerial decision.' };
  }

  if (!isDemoMode) {
    try {
      const supabase = await createClient();

      // Insert Decision
      const { data: decData, error: decErr } = await supabase
        .from('decisions')
        .insert({
          draft_id: draftId,
          decided_by: user.id,
          decision,
          reason: trimmedReason,
        })
        .select('id')
        .single();

      if (decErr) return { error: `Database error: ${decErr.message}` };

      // Update Draft Status
      const { error: draftUpdateErr } = await supabase
        .from('drafts')
        .update({ status: decision })
        .eq('id', draftId);

      if (draftUpdateErr) return { error: `Database error: ${draftUpdateErr.message}` };

      await writeAudit(
        { id: user.id, type: 'user', org_id: profile.org_id },
        `manager_${decision}`,
        { type: 'decision', id: decData.id },
        { draft_id: draftId, decision, reason: trimmedReason }
      );

      revalidatePath(`/drafts/${draftId}`);
      revalidatePath('/drafts');
      revalidatePath('/approvals');
      revalidatePath('/reviews');
      return { success: true };
    } catch (err: any) {
      console.error('[Supabase Decision Error]:', err.message);
      return { error: `Database error: ${err.message || 'Failed to record decision.'}` };
    }
  }

  // Demo store (Only reached when isDemoMode === true)
  recordDemoDecision({
    draftId,
    decidedBy: user.id,
    deciderName: profile.full_name,
    deciderRole: profile.role,
    decision,
    reason: trimmedReason,
  });

  addDemoAuditLog({
    action: `manager_${decision}`,
    actor_id: user.id,
    actor_type: 'user',
    actor_name: profile.full_name,
    entity_type: 'draft',
    entity_id: draftId,
    detail: { decision, reason: trimmedReason },
  });

  revalidatePath(`/drafts/${draftId}`);
  revalidatePath('/drafts');
  revalidatePath('/approvals');
  revalidatePath('/reviews');
  return { success: true };
}

export async function createNewVersion(draftId: string, newBody: string) {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return { error: 'Database not configured. Production requires a live Supabase connection.' };
  }

  if (!user || !profile) {
    return { error: 'Unauthorized.' };
  }

  const trimmed = newBody.trim();
  if (!trimmed) {
    return { error: 'Version content cannot be empty.' };
  }

  if (isDemoMode) {
    const existing = getDemoDraftById(draftId);
    if (!existing) {
      return { error: 'Draft not found.' };
    }
    if (profile.role === 'creator' && existing.draft.creator_id !== user.id) {
      return { error: 'Forbidden: Creators can only create new versions for their own drafts.' };
    }
  }

  // Run Review Agent on the new version content
  const agentRes = await runReviewAgent(trimmed, 'social', profile.org_id);

  if (!isDemoMode) {
    try {
      const supabase = await createClient();

      const { data: draft, error: fetchErr } = await supabase
        .from('drafts')
        .select('current_version, created_by')
        .eq('id', draftId)
        .single();

      if (fetchErr || !draft) {
        return { error: fetchErr?.message || 'Draft not found.' };
      }

      if (profile.role === 'creator' && draft.created_by !== user.id) {
        return { error: 'Forbidden: Creators can only create new versions for their own drafts.' };
      }

      const nextVer = (draft.current_version || 1) + 1;

      const { data: verData, error: verErr } = await supabase
        .from('draft_versions')
        .insert({
          draft_id: draftId,
          version_no: nextVer,
          body: trimmed,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (verErr || !verData) return { error: `Database error: ${verErr?.message || 'Failed to insert version.'}` };

      // Update draft
      await supabase
        .from('drafts')
        .update({ current_version: nextVer, status: 'checked' })
        .eq('id', draftId);

      // Insert findings
      if (agentRes.findings.length > 0) {
        await supabase.from('findings').insert(
          agentRes.findings.map((f) => ({
            draft_version_id: verData.id,
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
          }))
        );
      }

      await writeAudit(
        { id: user.id, type: 'user', org_id: profile.org_id },
        'draft_version_created',
        { type: 'draft_version', id: verData.id },
        { draft_id: draftId, version_no: nextVer, findings_count: agentRes.findings.length }
      );

      revalidatePath(`/drafts/${draftId}`);
      return { success: true, versionNo: nextVer };
    } catch (err: any) {
      console.error('[Supabase Version Creation Error]:', err.message);
      return { error: `Database error: ${err.message || 'Failed to create new draft version.'}` };
    }
  }

  // Demo store (Only reached when isDemoMode === true)
  const newVer = createDemoDraftVersion({
    draftId,
    body: trimmed,
    creatorId: user.id,
    findings: agentRes.findings,
  });

  addDemoAuditLog({
    action: 'draft_version_created',
    actor_id: user.id,
    actor_type: 'user',
    actor_name: profile.full_name,
    entity_type: 'draft_version',
    entity_id: newVer.id,
    detail: { draft_id: draftId, version_no: newVer.version_no, findings_count: agentRes.findings.length },
  });

  revalidatePath(`/drafts/${draftId}`);
  return { success: true, versionNo: newVer.version_no };
}
