-- BrandSure: Database Migration
-- Enables pgvector extension, creates domain tables, security roles, indexes, and RLS

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Organisations
CREATE TABLE IF NOT EXISTS public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles (maps to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('creator', 'reviewer', 'manager', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helper security functions for RLS
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Guidelines
CREATE TABLE IF NOT EXISTS public.guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  key TEXT,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_guidelines_org_key UNIQUE (org_id, key)
);

-- 4. Approved Facts
CREATE TABLE IF NOT EXISTS public.facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  statement TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL,
  as_of TEXT NOT NULL,
  source_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_facts_org_key UNIQUE (org_id, key)
);

-- 5. Glossary
CREATE TABLE IF NOT EXISTS public.glossary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  preferred TEXT NOT NULL,
  banned TEXT[] NOT NULL DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_glossary_org_preferred UNIQUE (org_id, preferred)
);

-- 6. Drafts
CREATE TABLE IF NOT EXISTS public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('social', 'email', 'blog', 'ad')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'checked', 'in_review', 'changes_requested', 'approved', 'rejected')),
  current_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Draft Versions
CREATE TABLE IF NOT EXISTS public.draft_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES public.drafts(id) ON DELETE CASCADE,
  version_no INT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Findings
CREATE TABLE IF NOT EXISTS public.findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_version_id UUID NOT NULL REFERENCES public.draft_versions(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
  span_text TEXT NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('guideline', 'fact', 'glossary', 'none')),
  source_id TEXT,
  source_excerpt TEXT,
  suggested_fix TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'edited', 'dismissed')),
  decision_reason TEXT,
  decided_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES public.drafts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Decisions
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES public.drafts(id) ON DELETE CASCADE,
  decided_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'changes_requested')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Audit Log (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  actor_id UUID,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'ai_agent', 'system')),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Append-only trigger for audit_log: Disallow UPDATE and DELETE
CREATE OR REPLACE FUNCTION public.enforce_audit_log_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only. UPDATE and DELETE operations are strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_append_only ON public.audit_log;
CREATE TRIGGER trg_audit_log_append_only
BEFORE UPDATE OR DELETE ON public.audit_log
FOR EACH ROW EXECUTE FUNCTION public.enforce_audit_log_append_only();

-- 12. Guideline Chunks (pgvector + FTS for Hybrid RAG)
CREATE TABLE IF NOT EXISTS public.guideline_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guideline_id UUID NOT NULL REFERENCES public.guidelines(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768),
  tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guideline_chunks_tsv ON public.guideline_chunks USING GIN(tsv);
CREATE INDEX IF NOT EXISTS idx_guideline_chunks_embedding ON public.guideline_chunks USING hnsw (embedding vector_cosine_ops);

-- 13. Agent Runs (Execution Traces)
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_version_id UUID NOT NULL REFERENCES public.draft_versions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'done', 'failed')),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  tool_call_count INT NOT NULL DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

-- Search function: Vector similarity
CREATE OR REPLACE FUNCTION public.match_guideline_chunks(
  query_embedding vector(768),
  p_org_id UUID,
  k INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  guideline_id UUID,
  content TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.guideline_id,
    gc.content,
    1 - (gc.embedding <=> query_embedding) AS similarity
  FROM public.guideline_chunks gc
  WHERE gc.org_id = p_org_id AND gc.embedding IS NOT NULL
  ORDER BY gc.embedding <=> query_embedding
  LIMIT k;
END;
$$ LANGUAGE plpgsql STABLE;

-- Search function: Full-Text Search
CREATE OR REPLACE FUNCTION public.search_guideline_chunks_fts(
  p_query TEXT,
  p_org_id UUID,
  k INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  guideline_id UUID,
  content TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.guideline_id,
    gc.content,
    ts_rank_cd(gc.tsv, plainto_tsquery('english', p_query)) AS rank
  FROM public.guideline_chunks gc
  WHERE gc.org_id = p_org_id
    AND gc.tsv @@ plainto_tsquery('english', p_query)
  ORDER BY rank DESC
  LIMIT k;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guideline_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

-- Organisations: Read user's own org
CREATE POLICY "Users can view their own organisation"
ON public.organisations FOR SELECT
USING (id = public.current_org_id());

-- Profiles: View profiles in same org
CREATE POLICY "Users can view profiles in their own organisation"
ON public.profiles FOR SELECT
USING (org_id = public.current_org_id());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- Guidelines, Facts, Glossary:
-- Any member in org can view
CREATE POLICY "Users can view org guidelines"
ON public.guidelines FOR SELECT
USING (org_id = public.current_org_id());

CREATE POLICY "Admins can manage guidelines"
ON public.guidelines FOR ALL
USING (org_id = public.current_org_id() AND public.current_role() = 'admin')
WITH CHECK (org_id = public.current_org_id() AND public.current_role() = 'admin');

CREATE POLICY "Users can view org facts"
ON public.facts FOR SELECT
USING (org_id = public.current_org_id());

CREATE POLICY "Admins can manage facts"
ON public.facts FOR ALL
USING (org_id = public.current_org_id() AND public.current_role() = 'admin')
WITH CHECK (org_id = public.current_org_id() AND public.current_role() = 'admin');

CREATE POLICY "Users can view org glossary"
ON public.glossary FOR SELECT
USING (org_id = public.current_org_id());

CREATE POLICY "Admins can manage glossary"
ON public.glossary FOR ALL
USING (org_id = public.current_org_id() AND public.current_role() = 'admin')
WITH CHECK (org_id = public.current_org_id() AND public.current_role() = 'admin');

-- Guideline Chunks:
CREATE POLICY "Users can view guideline chunks in org"
ON public.guideline_chunks FOR SELECT
USING (org_id = public.current_org_id());

CREATE POLICY "Admins can manage guideline chunks"
ON public.guideline_chunks FOR ALL
USING (org_id = public.current_org_id() AND public.current_role() = 'admin')
WITH CHECK (org_id = public.current_org_id() AND public.current_role() = 'admin');

-- Drafts:
-- Creator sees only own drafts. Reviewer, Manager, and Admin see all drafts in org.
CREATE POLICY "Drafts select policy by role"
ON public.drafts FOR SELECT
USING (
  org_id = public.current_org_id() AND (
    public.current_role() IN ('reviewer', 'manager', 'admin')
    OR creator_id = auth.uid()
  )
);

CREATE POLICY "Creators can insert own drafts"
ON public.drafts FOR INSERT
WITH CHECK (
  org_id = public.current_org_id()
  AND creator_id = auth.uid()
);

CREATE POLICY "Creators and Managers can update drafts"
ON public.drafts FOR UPDATE
USING (
  org_id = public.current_org_id() AND (
    creator_id = auth.uid()
    OR public.current_role() = 'manager'
  )
);

-- Draft Versions:
CREATE POLICY "Draft versions select policy"
ON public.draft_versions FOR SELECT
USING (
  draft_id IN (SELECT id FROM public.drafts)
);

CREATE POLICY "Creators can insert draft versions"
ON public.draft_versions FOR INSERT
WITH CHECK (
  draft_id IN (SELECT id FROM public.drafts WHERE creator_id = auth.uid())
  AND created_by = auth.uid()
);

-- Findings:
CREATE POLICY "Findings select policy"
ON public.findings FOR SELECT
USING (
  draft_version_id IN (SELECT id FROM public.draft_versions)
);

CREATE POLICY "Insert findings"
ON public.findings FOR INSERT
WITH CHECK (
  draft_version_id IN (SELECT id FROM public.draft_versions)
);

CREATE POLICY "Creators can update finding decisions"
ON public.findings FOR UPDATE
USING (
  draft_version_id IN (
    SELECT dv.id FROM public.draft_versions dv
    JOIN public.drafts d ON d.id = dv.draft_id
    WHERE d.creator_id = auth.uid()
  )
);

-- Comments:
CREATE POLICY "Users can view comments on org drafts"
ON public.comments FOR SELECT
USING (
  draft_id IN (SELECT id FROM public.drafts)
);

CREATE POLICY "Users can insert comments on org drafts"
ON public.comments FOR INSERT
WITH CHECK (
  draft_id IN (SELECT id FROM public.drafts)
  AND author_id = auth.uid()
);

-- Decisions:
CREATE POLICY "Users can view decisions on org drafts"
ON public.decisions FOR SELECT
USING (
  draft_id IN (SELECT id FROM public.drafts)
);

CREATE POLICY "Only managers can insert decisions"
ON public.decisions FOR INSERT
WITH CHECK (
  draft_id IN (SELECT id FROM public.drafts)
  AND public.current_role() = 'manager'
  AND decided_by = auth.uid()
);

-- Audit Log:
CREATE POLICY "Admins and Managers can view audit logs"
ON public.audit_log FOR SELECT
USING (
  org_id = public.current_org_id()
  AND public.current_role() IN ('admin', 'manager')
);

CREATE POLICY "Authenticated users and agents can insert audit logs"
ON public.audit_log FOR INSERT
WITH CHECK (
  org_id = public.current_org_id()
);

-- Agent Runs:
CREATE POLICY "Users can view agent runs for accessible drafts"
ON public.agent_runs FOR SELECT
USING (
  draft_version_id IN (SELECT id FROM public.draft_versions)
);

CREATE POLICY "Insert or update agent runs"
ON public.agent_runs FOR ALL
USING (
  draft_version_id IN (SELECT id FROM public.draft_versions)
);
