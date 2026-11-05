import rulebook from '../../seed/rulebook.json';
import type { Guideline, Fact, GlossaryEntry, AuditLogEntry, Profile, Role } from '@/types/database';

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
    entity_id: 'draft-version-demo-1',
    detail: {
      findings_count: 2,
      duration_ms: 680,
      bounded_citations: ['guideline-financial-promises', 'fact-upi-fee'],
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

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('placeholder.supabase.co'));
}
