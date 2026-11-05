import rulebook from '../../seed/rulebook.json';
import type {
  Guideline,
  Fact,
  GlossaryEntry,
  AuditLogEntry,
  Profile,
  Role,
  Draft,
  DraftVersion,
  Finding,
  FindingStatus,
  DraftStatus,
  Channel,
  Comment,
  Decision,
  Severity,
  SourceType,
} from '@/types/database';

export const DEMO_PROFILES: Record<string, { role: Role; full_name: string }> = {
  'creator@paynest.demo': { role: 'creator', full_name: 'PayNest Creator' },
  'reviewer@paynest.demo': { role: 'reviewer', full_name: 'PayNest Reviewer' },
  'manager@paynest.demo': { role: 'manager', full_name: 'PayNest Compliance Manager' },
  'admin@paynest.demo': { role: 'admin', full_name: 'PayNest Brand Admin' },
};

export const DEMO_ORG = {
  id: 'org-paynest-demo',
  name: 'PayNest',
};

// In-memory store for fallback offline mode
let inMemoryGuidelines: Guideline[] = rulebook.guidelines.map((g, index) => ({
  id: `guideline-${index + 1}`,
  key: g.id,
  org_id: DEMO_ORG.id,
  title: g.title,
  text: g.text,
  category: g.category,
  created_at: new Date(Date.now() - (6 - index) * 86400000).toISOString(),
}));

let inMemoryFacts: Fact[] = rulebook.facts.map((f, index) => ({
  id: `fact-${index + 1}`,
  key: f.key,
  org_id: DEMO_ORG.id,
  statement: f.statement,
  value: f.value,
  unit: f.unit,
  as_of: f.as_of,
  source_note: f.source_note,
  created_at: new Date(Date.now() - (5 - index) * 86400000).toISOString(),
}));

let inMemoryGlossary: GlossaryEntry[] = rulebook.glossary.map((item, index) => ({
  id: `glossary-${index + 1}`,
  org_id: DEMO_ORG.id,
  preferred: item.preferred,
  banned: item.banned,
  note: item.note,
  created_at: new Date(Date.now() - (10 - index) * 86400000).toISOString(),
}));

// Pre-seeded demo drafts
let inMemoryDrafts: (Draft & { finding_counts?: { high: number; medium: number; low: number } })[] = [
  {
    id: 'draft-demo-1',
    org_id: DEMO_ORG.id,
    creator_id: 'demo-creator',
    channel: 'social',
    status: 'checked',
    current_version: 1,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    profiles: {
      id: 'demo-creator',
      org_id: DEMO_ORG.id,
      full_name: 'PayNest Creator',
      role: 'creator',
      created_at: new Date().toISOString(),
    },
    finding_counts: { high: 1, medium: 1, low: 0 },
  },
  {
    id: 'draft-demo-2',
    org_id: DEMO_ORG.id,
    creator_id: 'demo-creator',
    channel: 'ad',
    status: 'checked',
    current_version: 1,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    profiles: {
      id: 'demo-creator',
      org_id: DEMO_ORG.id,
      full_name: 'PayNest Creator',
      role: 'creator',
      created_at: new Date().toISOString(),
    },
    finding_counts: { high: 0, medium: 1, low: 1 },
  },
  {
    id: 'draft-demo-3',
    org_id: DEMO_ORG.id,
    creator_id: 'demo-creator',
    channel: 'social',
    status: 'approved',
    current_version: 1,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    profiles: {
      id: 'demo-creator',
      org_id: DEMO_ORG.id,
      full_name: 'PayNest Creator',
      role: 'creator',
      created_at: new Date().toISOString(),
    },
    finding_counts: { high: 0, medium: 0, low: 0 },
  },
];

let inMemoryDraftVersions: DraftVersion[] = [
  {
    id: 'version-demo-1',
    draft_id: 'draft-demo-1',
    version_no: 1,
    body: 'Our app is the fastest in India, guaranteed to double your savings!',
    created_by: 'demo-creator',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'version-demo-2',
    draft_id: 'draft-demo-2',
    version_no: 1,
    body: 'Over 5 million customers rely on PayNest for zero transaction fee payments every day.',
    created_by: 'demo-creator',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'version-demo-3',
    draft_id: 'draft-demo-3',
    version_no: 1,
    body: 'Send money to your family and friends with PayNest. All UPI payments carry zero fees for our members.',
    created_by: 'demo-creator',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

let inMemoryFindings: Finding[] = [
  {
    id: 'finding-demo-1',
    draft_version_id: 'version-demo-1',
    category: 'claims',
    severity: 'medium',
    span_text: 'fastest in India',
    reason:
      'Superlative claim without approved substantiation. The fact base substantiates "2x faster than v1.0", not "fastest in India".',
    source_type: 'guideline',
    source_id: 'guideline-claims',
    source_excerpt:
      "Do not use superlatives such as 'best', 'No. 1', 'fastest', or 'cheapest' unless an exact, verified approved fact in the company fact base substantiates the claim.",
    suggested_fix: 'fast and reliable across India',
    status: 'open',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    ai_generated: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'finding-demo-2',
    draft_version_id: 'version-demo-1',
    category: 'financial-promises',
    severity: 'high',
    span_text: 'guaranteed to double your savings',
    reason:
      'Prohibited financial promise. Regulatory and brand guidelines strictly disallow claiming guaranteed returns or assured wealth doubling.',
    source_type: 'guideline',
    source_id: 'guideline-financial-promises',
    source_excerpt:
      'Never promise, state, or imply guaranteed financial returns, fixed interest profits, or risk-free investment outcomes. All financial growth and investment services are subject to market conditions and regulatory disclosures.',
    suggested_fix: 'designed to help grow your savings responsibly',
    status: 'open',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    ai_generated: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'finding-demo-3',
    draft_version_id: 'version-demo-2',
    category: 'claims',
    severity: 'medium',
    span_text: '5 million',
    reason:
      'Unsubstantiated user count metric. PayNest has 1.2 million registered members per verified company metrics, not 5 million.',
    source_type: 'fact',
    source_id: 'fact-user-count',
    source_excerpt: 'PayNest has 1.2 million registered members as of 30 September 2026.',
    suggested_fix: '1.2 million',
    status: 'open',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    ai_generated: true,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'finding-demo-4',
    draft_version_id: 'version-demo-2',
    category: 'terminology',
    severity: 'low',
    span_text: 'customers',
    reason: 'Use approved terminology "members". "customers" is non-compliant nomenclature.',
    source_type: 'glossary',
    source_id: 'glossary:members',
    source_excerpt: 'Refer to people who use PayNest as members to reinforce community focus.',
    suggested_fix: 'members',
    status: 'open',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    ai_generated: true,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

let inMemoryAuditLogs: (AuditLogEntry & { actor_name?: string })[] = [
  {
    id: 'audit-001',
    org_id: DEMO_ORG.id,
    actor_id: null,
    actor_type: 'system',
    action: 'database_seeded',
    entity_type: 'organisation',
    entity_id: DEMO_ORG.id,
    detail: {
      facts_count: rulebook.facts.length,
      guidelines_count: rulebook.guidelines.length,
      glossary_count: rulebook.glossary.length,
      status: 'success',
    },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    actor_name: 'System Engine',
  },
  {
    id: 'audit-002',
    org_id: DEMO_ORG.id,
    actor_id: 'user-admin',
    actor_type: 'user',
    action: 'guideline_created',
    entity_type: 'guideline',
    entity_id: 'guideline-financial-promises',
    detail: {
      title: 'Prohibition of Guaranteed Returns and Assured Outcomes',
      category: 'financial-promises',
      rule_ref: 'guideline-financial-promises',
    },
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    actor_name: 'PayNest Brand Admin',
  },
  {
    id: 'audit-003',
    org_id: DEMO_ORG.id,
    actor_id: 'user-admin',
    actor_type: 'user',
    action: 'fact_created',
    entity_type: 'fact',
    entity_id: 'fact-upi-fee',
    detail: {
      key: 'fact-upi-fee',
      statement: 'UPI payments on PayNest carry zero transaction fees for the user.',
      value: '0 INR',
    },
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    actor_name: 'PayNest Brand Admin',
  },
  {
    id: 'audit-004',
    org_id: DEMO_ORG.id,
    actor_id: null,
    actor_type: 'ai_agent',
    action: 'draft_checked',
    entity_type: 'draft_version',
    entity_id: 'version-demo-1',
    detail: {
      findings_count: 2,
      duration_ms: 680,
      bounded_citations: ['guideline-financial-promises', 'guideline-claims'],
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    actor_name: 'BrandSure AI Review Agent',
  },
];

export function getDemoGuidelines(): Guideline[] {
  return inMemoryGuidelines;
}

export function getDemoFacts(): Fact[] {
  return inMemoryFacts;
}

export function getDemoGlossary(): GlossaryEntry[] {
  return inMemoryGlossary;
}

export function getDemoAuditLogs(): (AuditLogEntry & { actor_name?: string })[] {
  return inMemoryAuditLogs;
}

export function addDemoAuditLog(entry: {
  action: string;
  actor_id?: string | null;
  actor_type: 'user' | 'ai_agent' | 'system';
  actor_name?: string;
  entity_type: string;
  entity_id: string;
  detail: Record<string, any>;
}) {
  const newLog: AuditLogEntry & { actor_name?: string } = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    org_id: DEMO_ORG.id,
    actor_id: entry.actor_id || null,
    actor_type: entry.actor_type,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    detail: entry.detail || {},
    created_at: new Date().toISOString(),
    actor_name: entry.actor_name,
  };
  inMemoryAuditLogs.unshift(newLog);
}

export function getDemoDrafts(): (Draft & { finding_counts?: { high: number; medium: number; low: number } })[] {
  // Update live finding counts
  return inMemoryDrafts.map((d) => {
    const version = inMemoryDraftVersions.find(
      (v) => v.draft_id === d.id && v.version_no === d.current_version
    );
    const findings = version ? inMemoryFindings.filter((f) => f.draft_version_id === version.id) : [];
    const openFindings = findings.filter((f) => f.status === 'open');

    return {
      ...d,
      finding_counts: {
        high: openFindings.filter((f) => f.severity === 'high').length,
        medium: openFindings.filter((f) => f.severity === 'medium').length,
        low: openFindings.filter((f) => f.severity === 'low').length,
      },
    };
  });
}

export function getDemoDraftById(draftId: string) {
  const draft = inMemoryDrafts.find((d) => d.id === draftId);
  if (!draft) return null;

  const version = inMemoryDraftVersions.find(
    (v) => v.draft_id === draftId && v.version_no === draft.current_version
  );

  const findings = version
    ? inMemoryFindings.filter((f) => f.draft_version_id === version.id)
    : [];

  return {
    draft,
    version,
    findings,
  };
}

export function createDemoDraft(params: {
  channel: Channel;
  text: string;
  creatorId: string;
  creatorName: string;
  findings: Array<any>;
}) {
  const draftId = `draft-${Date.now()}`;
  const versionId = `version-${Date.now()}`;

  const newDraft: Draft & { finding_counts?: { high: number; medium: number; low: number } } = {
    id: draftId,
    org_id: DEMO_ORG.id,
    creator_id: params.creatorId,
    channel: params.channel,
    status: 'checked',
    current_version: 1,
    created_at: new Date().toISOString(),
    profiles: {
      id: params.creatorId,
      org_id: DEMO_ORG.id,
      full_name: params.creatorName,
      role: 'creator',
      created_at: new Date().toISOString(),
    },
    finding_counts: {
      high: params.findings.filter((f) => f.severity === 'high').length,
      medium: params.findings.filter((f) => f.severity === 'medium').length,
      low: params.findings.filter((f) => f.severity === 'low').length,
    },
  };

  const newVersion: DraftVersion = {
    id: versionId,
    draft_id: draftId,
    version_no: 1,
    body: params.text,
    created_by: params.creatorId,
    created_at: new Date().toISOString(),
  };

  const newFindings: Finding[] = params.findings.map((f, idx) => ({
    id: `finding-${Date.now()}-${idx}`,
    draft_version_id: versionId,
    category: f.category,
    severity: f.severity,
    span_text: f.span_text,
    reason: f.reason,
    source_type: f.source_type,
    source_id: f.source_id,
    source_excerpt: f.source_excerpt,
    suggested_fix: f.suggested_fix,
    status: 'open',
    decision_reason: null,
    decided_by: null,
    decided_at: null,
    ai_generated: true,
    created_at: new Date().toISOString(),
  }));

  inMemoryDrafts.unshift(newDraft);
  inMemoryDraftVersions.unshift(newVersion);
  inMemoryFindings.unshift(...newFindings);

  return { draftId, versionId, findings: newFindings };
}

export function updateDemoFindingStatus(
  findingId: string,
  status: FindingStatus,
  decisionReason?: string | null,
  decidedBy?: string | null
) {
  const finding = inMemoryFindings.find((f) => f.id === findingId);
  if (!finding) return null;

  finding.status = status;
  finding.decision_reason = decisionReason || null;
  finding.decided_by = decidedBy || null;
  finding.decided_at = new Date().toISOString();

  return finding;
}

export function updateDemoDraftBody(draftId: string, newBody: string) {
  const draft = inMemoryDrafts.find((d) => d.id === draftId);
  if (!draft) return null;

  const version = inMemoryDraftVersions.find(
    (v) => v.draft_id === draftId && v.version_no === draft.current_version
  );
  if (version) {
    version.body = newBody;
  }
  return version;
}

export function updateDemoDraftStatus(draftId: string, status: DraftStatus) {
  const draft = inMemoryDrafts.find((d) => d.id === draftId);
  if (draft) {
    draft.status = status;
  }
  return draft;
}

let inMemoryComments: (Comment & { profiles?: Profile })[] = [
  {
    id: 'comment-demo-1',
    draft_id: 'draft-demo-1',
    author_id: 'demo-reviewer',
    body: "Please address the superlative claim 'fastest in India'. PayNest fact-app-speed only substantiates 2x benchmark speed compared to v1.0.",
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    profiles: {
      id: 'demo-reviewer',
      org_id: DEMO_ORG.id,
      full_name: 'PayNest Reviewer',
      role: 'reviewer',
      created_at: new Date().toISOString(),
    },
  },
];

let inMemoryDecisions: (Decision & { profiles?: Profile })[] = [
  {
    id: 'decision-demo-1',
    draft_id: 'draft-demo-3',
    decided_by: 'demo-manager',
    decision: 'approved',
    reason: 'Compliant copy fully grounded in fact-upi-fee. Approved for publication across digital channels.',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    profiles: {
      id: 'demo-manager',
      org_id: DEMO_ORG.id,
      full_name: 'PayNest Compliance Manager',
      role: 'manager',
      created_at: new Date().toISOString(),
    },
  },
];

export function getDemoComments(draftId: string) {
  return inMemoryComments.filter((c) => c.draft_id === draftId);
}

export function addDemoComment(params: {
  draftId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
}) {
  const newComment = {
    id: `comment-${Date.now()}`,
    draft_id: params.draftId,
    author_id: params.authorId,
    body: params.body,
    created_at: new Date().toISOString(),
    profiles: {
      id: params.authorId,
      org_id: DEMO_ORG.id,
      full_name: params.authorName,
      role: params.authorRole,
      created_at: new Date().toISOString(),
    },
  };
  inMemoryComments.push(newComment);
  return newComment;
}

export function getDemoDecisions(draftId: string) {
  return inMemoryDecisions.filter((d) => d.draft_id === draftId);
}

export function recordDemoDecision(params: {
  draftId: string;
  decidedBy: string;
  deciderName: string;
  deciderRole: Role;
  decision: 'approved' | 'rejected' | 'changes_requested';
  reason: string;
}) {
  const newDecision = {
    id: `decision-${Date.now()}`,
    draft_id: params.draftId,
    decided_by: params.decidedBy,
    decision: params.decision,
    reason: params.reason,
    created_at: new Date().toISOString(),
    profiles: {
      id: params.decidedBy,
      org_id: DEMO_ORG.id,
      full_name: params.deciderName,
      role: params.deciderRole,
      created_at: new Date().toISOString(),
    },
  };
  inMemoryDecisions.push(newDecision);

  // Update draft status
  updateDemoDraftStatus(params.draftId, params.decision);

  return newDecision;
}

export function getDemoDraftVersions(draftId: string) {
  return inMemoryDraftVersions
    .filter((v) => v.draft_id === draftId)
    .sort((a, b) => b.version_no - a.version_no);
}

export function createDemoDraftVersion(params: {
  draftId: string;
  body: string;
  creatorId: string;
  findings?: Array<{
    category: string;
    severity: Severity;
    span_text: string;
    reason: string;
    source_type: SourceType;
    source_id: string | null;
    source_excerpt: string;
    suggested_fix: string;
  }>;
}) {
  const existing = inMemoryDraftVersions.filter((v) => v.draft_id === params.draftId);
  const nextVerNo = existing.length + 1;
  const versionId = `version-${Date.now()}`;
  const newVersion: DraftVersion = {
    id: versionId,
    draft_id: params.draftId,
    version_no: nextVerNo,
    body: params.body,
    created_by: params.creatorId,
    created_at: new Date().toISOString(),
  };

  inMemoryDraftVersions.unshift(newVersion);

  if (params.findings && params.findings.length > 0) {
    const newFindings: Finding[] = params.findings.map((f, idx) => ({
      id: `finding-${Date.now()}-${idx}`,
      draft_version_id: versionId,
      category: f.category,
      severity: f.severity,
      span_text: f.span_text,
      reason: f.reason,
      source_type: f.source_type,
      source_id: f.source_id,
      source_excerpt: f.source_excerpt,
      suggested_fix: f.suggested_fix,
      status: 'open',
      decision_reason: null,
      decided_by: null,
      decided_at: null,
      ai_generated: true,
      created_at: new Date().toISOString(),
    }));
    inMemoryFindings.unshift(...newFindings);
  }

  const draft = inMemoryDrafts.find((d) => d.id === params.draftId);
  if (draft) {
    draft.current_version = nextVerNo;
    draft.status = 'checked';
  }

  return newVersion;
}

export function getDemoOpenHighFindingsCount(draftId: string): number {
  const versions = inMemoryDraftVersions.filter((v) => v.draft_id === draftId).sort((a, b) => b.version_no - a.version_no);
  if (versions.length === 0) return 0;
  const latestVerId = versions[0].id;
  return inMemoryFindings.filter(
    (f) => f.draft_version_id === latestVerId && f.severity === 'high' && f.status === 'open'
  ).length;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('placeholder.supabase.co'));
}
