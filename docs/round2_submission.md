# BrandSure — Round 2 Submission Report

**Project**: BrandSure — Pre-Publication Brand Governance for Fintech  
**Event**: CodeNexus India 2026, Round 2 (Functional Product)  
**Demonstration Brand**: PayNest (fictional UPI payments and investing app)  
**Date**: 8 November 2026  
**Repository**: [https://github.com/Mokshith1817/demo](https://github.com/Mokshith1817/demo)  
**Live Application**: [http://localhost:3000](http://localhost:3000) (or deployed Vercel URL per deployment guide)

---

## 1. List of Completed Features (Only What Actually Works)

Every feature listed below is fully implemented, verified, and testable end-to-end:

1. **Data Store Truth & Mode Separation**:
   - Production strictly requires a live Supabase PostgreSQL connection with `pgvector`, Row Level Security, and append-only database triggers. If credentials are missing in production (`NODE_ENV=production`), the app safely halts with a clear `DatabaseNotConfigured` refusal gate. In local development, setting `DEMO_MODE=true` activates an in-memory demo store pre-loaded with PayNest's rulebook, sample drafts, and audit trail, allowing developers to test without external setup friction.
   - The UI displays an explicit data store indicator in the navigation bar (`Data store: Supabase` vs `Data store: Demo store (development)`).

2. **Real Email & Password Authentication with 4 Server-Enforced Roles**:
   - Four distinct governance roles: **Creator**, **Reviewer**, **Manager**, and **Admin**.
   - Authenticated through Supabase Auth using email and password via `@supabase/ssr`.
   - Roles are read **strictly from the `profiles` table on the server** for every protected page, server action, and route handler. Roles are NEVER trusted from the client or cookies.
   - **Self Sign-Up (`/signup`)**: Allows evaluators to create a new user account with name, email, and password (min 8 chars). The server strictly assigns role `'creator'` in the PayNest organisation—the client cannot choose or escalate its role.
   - **Creator Draft Isolation**: Creators can view and edit only their own drafts (`creator_id === user.id`). Unauthorized cross-creator draft access is rejected with HTTP 403 Forbidden.

3. **Bounded Compliance Review Agent**:
   - Five specialized modular tools:
     - `check_terminology`: Exact matching against approved vs. banned glossary terms (e.g., "members" vs. "customers").
     - `lookup_fact`: Deterministic extraction and verification of numbers, fees, and operational claims against the structured `facts` table.
     - `retrieve_guideline`: Hybrid vector similarity (`pgvector`) and full-text search (PostgreSQL `tsvector`) with Reciprocal Rank Fusion (RRF).
     - `judge_claim`: Semantic evaluation using Google Gemini 2.5 Flash, strictly bounded by retrieved snippets, with a deterministic regex and pattern fallback layer.
     - `check_accessibility`: Formatting and readability rules (shouting caps, repeated punctuation, plain reading level).
   - **Ungrounded Claim Policy**: If no approved source supports a verdict, the system explicitly outputs *"No approved source found"*.

4. **Interactive Draft Review Workspace (`/drafts/[id]`)**:
   - Real-time text span highlighting for all flagged issues.
   - Finding cards displaying category, severity badge (High = Red, Medium = Amber, Low = Blue), reason, expandable source citation, and intent-preserving rewrite suggestion visibly labeled *"AI-generated suggestion"*.
   - Three creator actions:
     - **Accept Fix**: Replaces the offending text in place and marks the finding as accepted.
     - **Edit Fix**: Allows the creator to customize the replacement text before applying it.
     - **Dismiss Finding**: Requires a mandatory written justification (e.g., "Approved waiver from Legal") before dismissing.

5. **Multi-Version Iteration & Visual DiffView**:
   - Version history tracking (`v1`, `v2`, etc.) with author attribution and timestamps.
   - Inline visual `DiffView` comparing any two versions with additions in green and removals in red, accompanied by explicit accessibility labels.
   - Creator can revise draft text and click *"Save & Run Check as Version X"*, automatically re-evaluating the new text against the approved rulebook.

6. **Human-in-the-Loop Collaboration**:
   - Contextual commentary thread where Reviewers, Managers, and Creators exchange editorial feedback with role badges and timestamps.
   - Status flow enforced server-side: `draft` $\rightarrow$ `checked` $\rightarrow$ `in_review` $\rightarrow$ (`approved` | `rejected` | `changes_requested`).
   - Creator action *"Submit for review"* requires that no High-severity finding remains open without a recorded justification.

7. **Manager Decision Panel**:
   - Dedicated panel restricted strictly to Compliance Managers and Admins.
   - Three decisive actions: **Approve**, **Request Changes**, **Reject**.
   - Mandatory written justification required for all three decisions. The AI cannot approve, reject, or publish.

8. **Append-Only Audit Trail (`/audit`)**:
   - Every system event (draft creation, agent tool executions, finding dispositions, comments, manager decisions) is written to `audit_log`.
   - Protected in PostgreSQL on Supabase by trigger `trg_audit_log_append_only` which throws an exception on any `UPDATE` or `DELETE` attempt.
   - Searchable and filterable table by action, actor type (`user`, `ai_agent`, `system`), and date, with an interactive modal to inspect the raw JSON trace payload. Wrapped in horizontal scroll containers (`min-w-[640px]`) for clean mobile responsiveness.

9. **Brand Rulebook & Admin Source Management**:
   - Public reference viewer (`/rules`) displaying PayNest's active guidelines, facts, and glossary terms.
   - Admin management consoles (`/admin/guidelines`, `/admin/facts`, `/admin/glossary`) to create, edit, or delete rules, with automatic text chunking and vector embedding generation.

10. **Benchmark Evaluation Suite**:
    - Automated benchmark runner (`scripts/run_testset.ts` / `npm run test:benchmark`) testing 12 drafts (6 flawed, 6 clean).
    - Scope Note: 12-draft sanity check on drafts written alongside the rulebook; not a general accuracy figure; larger test set planned for Round 3. Results saved to `seed/results.json`.

11. **Public Guidance & AI Disclosure Pages**:
    - `/demo-guide`: Public walkthrough explaining app purpose, governance roles, 8-step journey, and 3 copy-paste test drafts (no passwords).
    - `/about-ai`: Transparent disclosure of Gemini models used, data privacy policies, and the "Humans Decide" governance boundary.

---

## 2. Features Planned but Not Completed

To maintain complete transparency with hackathon evaluators, the following features were considered in initial ideation but were intentionally excluded or deferred:

1. **Multimodal Image and Creative Banner Inspection**:
   - *Status*: Deferred to Round 3.
   - *Reason*: Initial scoping included checking marketing image creatives for brand color palettes, font hierarchy, and logo clear-space. Per Round 2 guidance (*"DO NOT: add image checks, the insights dashboard, or PDF import"*), we focused 100% of our engineering bandwidth on delivering a flawless, high-precision text compliance workflow.
2. **Aggregated Governance Insights & Analytics Dashboard**:
   - *Status*: Deferred to Round 3.
   - *Reason*: While the underlying data model stores complete metadata (categories, severities, cited rules, dismissal reasons), UI charts and analytical aggregations were explicitly restricted in Round 2 instructions.
3. **Multi-Brand Tenant Workspace Partitioning**:
   - *Status*: Scoped to single sample brand (PayNest).
   - *Reason*: The database schema supports `organisations`, but cross-tenant brand switching was deemed unnecessary complexity for the hackathon judging journey.

---

## 3. Technology and Implementation Details

### Architecture & Runtime
- **Next.js 15 (App Router)** running on Node.js with TypeScript 5.7.
- **Supabase Authentication**: Real email and password authentication through `@supabase/ssr` cookies. Roles are verified strictly on the server by querying the `profiles` table.
- **Server Actions** handle state mutations (draft submission, finding updates, managerial verdicts) with automatic path revalidation (`revalidatePath`).
- **Tailwind CSS + shadcn/ui tokens**: Clean, professional fintech typography with Inter globally applied via `next/font`, an 8px spatial grid, and WCAG AA contrast.
- **Date Formatting**: Explicit UTC getters (`getUTCDate`, `getUTCHours`, etc.) ensure deterministic server and client rendering, eliminating hydration mismatch warnings.

### Retrieval-Augmented Generation (RAG) Approach
- **Say plainly**: Retrieval in BrandSure is **HYBRID**.
  - **Dense Vector Retrieval**: Guideline documents are partitioned into 40–120 word logical chunks. Each chunk is embedded into a 768-dimensional vector using Google Gemini `text-embedding-004` and indexed in PostgreSQL using `pgvector` with an **HNSW** index (`m=16`, `ef_construction=64`, cosine distance).
  - **Sparse Full-Text Retrieval**: Guideline chunks are parsed into PostgreSQL `tsvector` columns and queried using `websearch_to_tsquery('english', text)` backed by a **GIN index**.
  - **Reciprocal Rank Fusion (RRF)**: The results from dense vector search and sparse full-text search are merged using the RRF algorithm with a constant $k=60$. Only the top 3 highest-ranking snippets above a calibrated confidence threshold are returned to the agent.
  - **Direct Numeric Lookup**: Exact figures, fees, and operational metrics are looked up directly from the relational `facts` table to eliminate vector distortion on numbers.

### Agent Design & Anti-Hallucination Guardrails
- **Grounded Judging**: The LLM (`gemini-2.5-flash`) is provided *only* with the retrieved guideline snippets and structured facts. Each snippet is assigned a unique reference ID.
- **Strict Bounding**: The model must return the rule ID it relied upon. If an ungrounded claim is made or no rule applies, the agent returns `"source_type": "none"` and `"source_excerpt": "No approved source found."`
- **Deterministic Fallback Layer**: If the Gemini API key is not supplied, rate-limited, or unavailable, the agent seamlessly falls back to a deterministic regex pattern engine containing verified regulatory rules (guaranteed returns, unsubstantiated superlatives, flippant tone). This ensures high reliability during evaluation without external disruptions.
- **Verification of Suggested Fixes**: Every suggested fix is checked to ensure it softens or removes the non-compliant claim without inventing substitute figures.

---

## 4. Changes from the Round 1 Plan, and Why

1. **Real Email & Password Auth Over Simulated Logins**:
   - *Round 1 Plan*: Considered rapid mock personas for quick evaluator switching.
   - *Change*: Implemented complete, production-grade email-and-password authentication via Supabase Auth and `@supabase/ssr`, accompanied by an open self sign-up flow at `/signup` and server-enforced role checks from the `profiles` table.
   - *Why*: Eliminates security loopholes, prevents cookie role-tampering, and demonstrates enterprise architecture ready for production deployment.
2. **Deterministic Fallback for Reliable Benchmark Availability**:
   - *Round 1 Plan*: Relied entirely on external LLM calls for claim evaluation.
   - *Change*: Implemented a deterministic regex and rule matching layer that works in tandem with Gemini 2.5 Flash.
   - *Why*: Eliminates test-suite flakiness caused by external API rate limits or network latency, delivering 100% precision and recall on the 12-draft canonical benchmark sanity check.
3. **Structured Span Highlighting over WYSIWYG Editing**:
   - *Round 1 Plan*: Considered integrating a rich-text editor (e.g., TipTap or Quill).
   - *Change*: Implemented structured span highlighting with inline accept/edit/dismiss buttons and a dedicated `DiffView`.
   - *Why*: Rich-text editors introduce HTML bloat that makes diffing, audit tracking, and accessibility verification difficult. Clean plain-text with coordinate span mapping provides superior governance traceability.

---

## 5. Three Improvements for Round 3

### 1. Multimodal Image and Visual Consistency Checks
In Round 3, BrandSure will introduce a multimodal inspection pipeline powered by Gemini 2.5 Flash Vision to evaluate social media graphics, display ad creatives, and PDF promotional flyers. The vision agent will verify brand asset guidelines, including official PayNest hex color consistency, logo clear-space margins, and contrast ratios. Crucially for fintech, it will perform automated OCR to verify that mandatory regulatory disclaimers (such as *"Mutual fund investments are subject to market risks"*) meet statutory font size and visibility guidelines.

### 2. Governance Insights Dashboard with Unclear-Guideline Detection
While Round 2 stores comprehensive finding dispositions, Round 3 will surface a rich analytical dashboard for brand compliance officers. The system will aggregate historical creator dismissals and managerial edits to automatically flag ambiguous, outdated, or frequently-contested guidelines (e.g., identifying that 40% of creators dismiss a specific superlative rule because it contradicts recent product feature updates). This transforms BrandSure from a reactive copy-checker into a proactive brand-intelligence platform that continuously improves the rulebook.

### 3. Scaled Benchmark Evaluation on a 200+ Production Corpus
In Round 2, the benchmark runner verified 12 canonical test drafts (14/14 True Positives, 0 False Positives, 0 False Negatives on the sanity check set). For Round 3, we will expand this benchmark suite to 200+ multi-channel drafts sourced from real-world fintech campaigns, covering edge-case comparative advertising, multilingual vernacular copy (Hindi, Tamil, Telugu), and complex multi-claim marketing paragraphs. We will measure latency percentiles ($p50, p95, p99$) and RRF retrieval accuracy across large knowledge bases exceeding 5,000 guideline chunks.

---

## 6. Testing Guide for Judges (8-Step Walkthrough)

Evaluators can complete the entire core journey in under 3 minutes:

### How to Access Test Accounts
- **Self Sign-Up**: Anyone can create a new **Creator** account directly at `/signup` to test the drafting, AI review, and submission flow.
- **Judge Accounts**: Dedicated test accounts for Reviewer, Manager, and Admin roles are provided directly in the submitted evaluation PDF.

### Walkthrough Steps
1. **Admin sets ground truth**: Log in with the Admin account. Navigate to `/admin/guidelines` or `/rules` to review approved guidelines, facts, and glossary entries.
2. **Creator submits draft**: Sign in as a Creator (or self sign-up at `/signup`). Click **New Draft**, select channel `social`, and paste the following flawed draft:
   > *"Our app is the fastest in India, guaranteed to double your savings!"*
   Click **Run Compliance Check**.
3. **Inspect Bounded Findings**: The Draft Review Workspace loads with 2 highlighted findings:
   - *High Severity*: *"guaranteed to double your savings"* $\rightarrow$ Cites `guideline-financial-promises`. Suggests *"designed to help grow your savings responsibly"*.
   - *Medium Severity*: *"fastest in India"* $\rightarrow$ Cites `guideline-claims`. Suggests *"fast and reliable across India"*.
4. **Creator Takes Action**:
   - On the first finding, click **Accept Fix** (text updates automatically).
   - On the second finding, click **Accept Fix** or click **Dismiss** and type a justification (e.g., *"Legal waiver #402 approved"*).
5. **Submit for Review**: With all High-severity findings resolved, click **Submit for Review**. The status advances from `checked` to `in_review`.
6. **Reviewer Adds Comment**: Sign in with the Reviewer account. Open the **Review Queue** (`/reviews`), select the draft, switch to the **Comments** tab, and post:
   > *"Checked the revised copy against our new campaign theme. Looks compliant and ready for manager sign-off."*
7. **Manager Approves with Justification**: Sign in with the Manager account. Open **Approvals Queue** (`/approvals`), open the draft, inspect the **Diff** and commentary, click **Record Decision**, select **Approve**, type:
   > *"Approved for immediate digital distribution across social channels."*
   and submit. The draft moves to `approved` and locks.
8. **Verify Append-Only Audit Trail**: Navigate to `/audit`. Inspect the complete chronological trail: draft creation, AI tool calls, finding disposition, comment, and manager approval. Click any row to inspect the raw JSON metadata.

---

## 7. AI and External Services Disclosure

### External Services
- **Google Gemini API**: Used for semantic claim evaluation (`gemini-2.5-flash`) and vector embeddings (`text-embedding-004`).
- **Supabase**: Managed PostgreSQL database providing `pgvector`, Row-Level Security, and transaction triggers.
- **Vercel**: Edge hosting and serverless deployment platform.

### Development Attributions
- Scaffolding, architecture design, and benchmark test automation were developed in pair programming with **Google Antigravity**, an agentic AI coding assistant.
- All compliance logic, regulatory rule mappings (SEBI/ASCI/RBI), database constraints, and anti-hallucination bounds were reviewed, verified, and audited by human engineers.

---

## 8. Claims and Verification Evidence Table

To uphold the highest standards of scientific and engineering honesty, every major claim made in our submission, README, and demo guide is cross-referenced against reproducible raw evidence:

| # | System Claim | Where Stated | Ground Truth & Real Implementation | Verification Evidence File |
|---|---|---|---|---|
| 1 | **Data Store Truth** | §1.1, README §4, `/about-ai` | Production strictly requires live Supabase credentials; halts with `DatabaseNotConfigured` gate if missing. Demo mode operates exclusively in development when `DEMO_MODE=true`. | `src/lib/data-store.ts`, `docs/qa-evidence/phase-1/01_production_no_env.log` |
| 2 | **Server-Enforced Roles & Self Sign-up** | §1.2, README §4 | Real Supabase Auth. Roles read strictly from `profiles` on server. Self sign-up at `/signup` enforces `creator` role; role escalation in request payload is ignored. | `src/lib/session.ts`, `src/app/actions/auth.ts`, `tests/tamper.test.ts` |
| 3 | **Creator Draft Isolation** | §1.2, §3 | Edge middleware and server actions enforce `creator_id === user.id`. Cross-creator access attempts are rejected with HTTP 403 Forbidden. | `src/middleware.ts`, `tests/tamper.test.ts`, `docs/qa-evidence/phase-8/01_e2e_results.log` |
| 4 | **Append-Only Audit Log** | §1.8, README §2, `/demo-guide` | In PostgreSQL on Supabase, trigger `trg_audit_log_append_only` rejects all `UPDATE` and `DELETE` queries with an exception. | `supabase/migrations/20261105000000_init_brandsure.sql`, `tests/audit-tamper.test.ts`, `docs/qa-evidence/phase-3/01_audit_tamper_results.log` |
| 5 | **Clean Console & Responsive Layout** | §3, README §3 | Root-cause UTC formatting eliminates timezone hydration mismatches. Tables feature horizontal scroll wrappers (`min-w-[640px]`). Inter font applied globally without serif leaks (verified via headless Chrome). | `src/lib/utils.ts`, `docs/qa-evidence/phase-2-visuals/`, `scripts/verify_p2_visuals.mjs` |
| 6 | **Benchmark Sanity Check** | §1.10, §5.3, README §8 | Evaluated on 12-draft PayNest benchmark sanity check test set (6 flawed, 6 clean): 14/14 True Positives, 0 False Positives, 0 False Negatives. Larger corpus planned for Round 3. | `seed/results.json`, `docs/qa-evidence/phase-8/04_benchmark.log` |
| 7 | **Empirical Production Latency** | §6, README §9 | 17/17 automated end-to-end checks verified against live production build with an average HTTP latency of 5ms (zero invented or estimated figures). | `scripts/e2e_verification.mjs`, `docs/qa-evidence/phase-8/01_e2e_results.log`, `docs/qa-evidence/phase-8/results.md` |
