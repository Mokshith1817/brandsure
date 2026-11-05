import { createServiceClient } from './supabase/service';
import type { ActorType } from '@/types/database';

export interface AuditActor {
  id?: string | null;
  type: ActorType;
  org_id: string;
}

export interface AuditEntity {
  type: string;
  id: string;
}

export async function writeAudit(
  actor: AuditActor,
  action: string,
  entity: AuditEntity,
  detail: Record<string, any> = {}
): Promise<void> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from('audit_log').insert({
      org_id: actor.org_id,
      actor_id: actor.id || null,
      actor_type: actor.type,
      action,
      entity_type: entity.type,
      entity_id: entity.id,
      detail,
    });

    if (error) {
      console.error('[writeAudit Error]:', error.message, { action, entity });
    }
  } catch (err: any) {
    console.error('[writeAudit Exception]:', err.message);
  }
}
