export type Role = 'creator' | 'reviewer' | 'manager' | 'admin';

export type Channel = 'social' | 'email' | 'blog' | 'ad';

export type DraftStatus =
  | 'draft'
  | 'checked'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected';

export type Severity = 'high' | 'medium' | 'low';

export type SourceType = 'guideline' | 'fact' | 'glossary' | 'none';

export type FindingStatus = 'open' | 'accepted' | 'edited' | 'dismissed';

export type ActorType = 'user' | 'ai_agent' | 'system';

export interface Organisation {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Guideline {
  id: string;
  org_id: string;
  key?: string | null;
  title: string;
  text: string;
  category: string;
  created_at: string;
}

export interface Fact {
  id: string;
  org_id: string;
  key: string;
  statement: string;
  value: string;
  unit: string;
  as_of: string;
  source_note?: string | null;
  created_at: string;
}

export interface GlossaryEntry {
  id: string;
  org_id: string;
  preferred: string;
  banned: string[];
  note?: string | null;
  created_at: string;
}

export interface Draft {
  id: string;
  org_id: string;
  creator_id: string;
  channel: Channel;
  status: DraftStatus;
  current_version: number;
  created_at: string;
  profiles?: Profile;
}

export interface DraftVersion {
  id: string;
  draft_id: string;
  version_no: number;
  body: string;
  created_by: string;
  created_at: string;
}

export interface Finding {
  id: string;
  draft_version_id: string;
  category: string;
  severity: Severity;
  span_text: string;
  reason: string;
  source_type: SourceType;
  source_id?: string | null;
  source_excerpt?: string | null;
  suggested_fix?: string | null;
  status: FindingStatus;
  decision_reason?: string | null;
  decided_by?: string | null;
  decided_at?: string | null;
  ai_generated: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  draft_id: string;
  author_id: string;
  body: string;
  created_at: string;
  profiles?: Profile;
}

export interface Decision {
  id: string;
  draft_id: string;
  decided_by: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  reason: string;
  created_at: string;
  profiles?: Profile;
}

export interface AuditLogEntry {
  id: string;
  org_id: string;
  actor_id?: string | null;
  actor_type: ActorType;
  action: string;
  entity_type: string;
  entity_id: string;
  detail: Record<string, any>;
  created_at: string;
}

export interface GuidelineChunk {
  id: string;
  guideline_id: string;
  org_id: string;
  content: string;
  embedding?: number[] | null;
  created_at: string;
}

export interface AgentRun {
  id: string;
  draft_version_id: string;
  status: 'running' | 'done' | 'failed';
  steps: Array<{
    step: string;
    tool_name?: string;
    input?: any;
    result?: any;
    duration_ms?: number;
    timestamp?: string;
  }>;
  tool_call_count: number;
  error?: string | null;
  started_at: string;
  finished_at?: string | null;
}
