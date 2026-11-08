# BrandSure — Pre-Publication Brand Governance for Fintech

> **A bounded, citation-backed AI compliance checkpoint for marketing content before it reaches customers.**  
> *Built for **CodeNexus India 2026** (Round 2: Functional Product). Demonstrated with **PayNest**, a fictional UPI payments and investing app.*  
> **Live Deployed URL**: [https://demo-rho-nine-62.vercel.app](https://demo-rho-nine-62.vercel.app)

[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)]()
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20pgvector-emerald.svg)]()
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-indigo.svg)]()
[![Benchmark](https://img.shields.io/badge/Benchmark-12--Draft%20Sanity%20Check-blue.svg)]()

---

## 1. What It Is

In regulated fintech marketing, publishing an inaccurate metric, unsubstantiated superlative, or non-compliant return guarantee can trigger severe regulatory penalties (SEBI, RBI, ASCI) and permanent loss of consumer trust.

**BrandSure** is an enterprise pre-publication governance platform that solves this:
- **Strictly Bounded AI**: The AI only reads, flags, and suggests against *approved* internal rulebooks, fact bases, and glossaries. It **never invents rules or facts**. If an ungrounded claim is found, it explicitly declares *"No approved source found"*.
- **Humans Decide**: The AI cannot approve, reject, publish, or overwrite text. Final editorial and compliance actions remain strictly in human hands (Creators, Reviewers, Managers).
- **Verifiable Citations**: Every finding includes the exact rule or fact cited, a plain-language explanation of why it was flagged, and an intent-preserving rewrite visibly labelled *"AI-generated suggestion"*.
- **Append-Only Audit Log**: Every tool execution, creator disposition (accept/edit/dismiss), and manager verdict is recorded in an append-only database table protected by PostgreSQL triggers in production (`trg_audit_log_append_only`).

---

## 2. Core Workflow

```
[Brand Admin] Adds approved guidelines, verified facts, and preferred terms (vectorized into pgvector)
      │
      ▼
[Creator] Submits draft across marketing channels (social, email, ad, blog)
      │
      ▼
[Bounded Review Agent] Evaluates text against ONLY approved sources
      ├── Exact Lookup (Numbers, fees, partner banks, verified metrics)
      ├── Deterministic Glossary Matching (banned vs. preferred terms)
      ├── Hybrid Retrieval (pgvector cosine similarity + Full-Text Search via Reciprocal Rank Fusion)
      └── Bounded Claim Judging (Gemini 2.5 Flash with fallback to deterministic rule engine)
      │
      ▼
[Draft Review Workspace]
      ├── Interactive Span Highlighting & Severity Badging (High = Red, Medium = Amber, Low = Blue)
      ├── Expandable Source Citations with exact rule excerpts
      └── Intent-Preserving Fixes (Creator accepts fix, edits inline, or dismisses with written reason)
      │
      ▼
[Multi-Role Review & Approval]
      ├── Reviewer inspects diff history and adds editorial commentary
      └── Compliance Manager approves, requests changes, or rejects with mandatory justification
      │
      ▼
[Append-Only Audit Log] Postgres trigger prevents UPDATE and DELETE in production
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) + React 19 | Server Actions, Server Components, and Edge middleware |
| **Language** | TypeScript 5.7 | Strict end-to-end type safety |
| **Styling & UI** | Tailwind CSS + shadcn/ui tokens | Clean fintech design system (8px grid, Inter font, WCAG AA contrast) |
| **Icons & Feedback** | Lucide React + Sonner | Accessible icons paired with text labels; non-blocking toasts |
| **Database** | Supabase (PostgreSQL 15) | Relational store with Row Level Security (RLS) policies |
| **Vector Search** | `pgvector` (HNSW cosine similarity) | 768-dimensional indexing of guideline rule chunks |
| **Full-Text Search** | Postgres `tsvector` + GIN Index | Keyword search merged with vector search via Reciprocal Rank Fusion (RRF) |
| **LLM & Embeddings** | Google Gemini API | `gemini-2.5-flash` for claim judging; `text-embedding-004` for vectors |
| **Validation** | Zod 4 | Runtime schema validation for LLM responses and server actions |
| **Diff Engine** | `diff` | Character and token-level diff tracking between draft versions |

---

## 4. Architecture Summary

### Data Store Architecture
BrandSure enforces clean data store separation:
1. **Cloud Supabase Mode (Production)**: Connects to Supabase Postgres, executes pgvector cosine distance queries, and enforces Row-Level Security policies and append-only database triggers. Production strictly requires live Supabase credentials and halts with a clear `DatabaseNotConfigured` gate if missing.
2. **Demo Mode (Local Development Only)**: Permitted exclusively in development environments when `DEMO_MODE=true` is set. Uses an in-memory store and cryptographically signed session cookies pre-loaded with PayNest's rulebook, sample drafts, and audit events, ensuring seamless developer evaluation without external setup friction.

### Bounded Retrieval & Reciprocal Rank Fusion (RRF)
Guideline retrieval combines two complementary search methods:
- **Dense Vector Search**: Computes cosine distance against 768-dimensional embeddings of 40–120 word rule chunks.
- **Sparse Full-Text Search**: Matches keywords using PostgreSQL `websearch_to_tsquery`.
- **RRF Merge**: Normalizes rankings using standard reciprocal rank fusion (`1 / (60 + rank)`) to return the top 3 highest-confidence rule snippets.
- **Confidence Gate**: Snippets below the minimum threshold are discarded, returning *"No approved source found"*.

### Four Role-Based Governance Roles
- **Creator**: Authors drafts, reviews AI findings, applies fixes, dismisses with reason, and submits for review.
- **Reviewer**: Views review queue, inspects multi-version diffs, and contributes editorial comments.
- **Manager**: Makes final governance decisions (Approve, Request Changes, Reject) with mandatory written justification.
- **Admin**: Curates guidelines, updates facts, manages glossary, triggers vector re-indexing, and reviews audit logs.

---

## 5. How to Run Locally

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm or pnpm

### Step 1: Clone the repository
```bash
git clone https://github.com/Mokshith1817/demo.git brandsure
cd brandsure
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Data Store Mode (set to true for local development demo mode)
DEMO_MODE=true

# Session Signing Secret (required for HMAC-SHA256 session cookies)
SESSION_SECRET=your-32-character-secret-key-for-sessions

# Supabase Configuration (Strictly required in production; optional when DEMO_MODE=true)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini API (Optional: falls back to deterministic rule engine if absent)
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

> **Data Store Modes**:
> - **Local Development**: Setting `DEMO_MODE=true` activates the zero-config demo store with pre-loaded PayNest guidelines, sample drafts, audit trail, and cryptographically signed HMAC session cookies.
> - **Production Deployment**: A live Supabase PostgreSQL database with `pgvector` and append-only database triggers is strictly required. If credentials are missing in production, the application refuses to run and displays a `DatabaseNotConfigured` refusal gate. For deployment instructions, see [`docs/deployment_guide.md`](file:///Users/mokshith/Projects/demo/docs/deployment_guide.md).

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DEMO_MODE` | Optional (`true` in dev) | Activates in-memory demo store and sample PayNest dataset |
| `SESSION_SECRET` | Required | Secret key for Web Crypto HMAC-SHA256 session cookie signing |
| `NEXT_PUBLIC_SUPABASE_URL` | Required in Production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required in Production | Public Supabase client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Required in Production | Privileged Supabase key for administrative migrations/seeding |
| `GEMINI_API_KEY` | Optional (Fallback to rules) | Google Gemini API key for claim evaluation |
| `GEMINI_MODEL` | Optional (Default: `gemini-2.5-flash`) | Gemini model identifier for compliance reasoning |
| `GEMINI_EMBEDDING_MODEL` | Optional (Default: `text-embedding-004`)| Gemini model identifier for generating vector embeddings |

---

## 7. How to Seed the Database

To initialize or reset the database schema and load canonical PayNest rules, facts, and glossary entries into Supabase:
```bash
npm run seed
```
This script reads `seed/rulebook.json`, generates 768-dimensional vector embeddings for each guideline chunk, provisions judge user accounts configured via environment variables, and writes rows into `organisations`, `profiles`, `facts`, `guidelines`, `guideline_chunks`, `glossary`, and initial audit logs.

---

## 8. Benchmark Evaluation Suite

BrandSure includes an automated evaluation runner:
```bash
npm run test:benchmark
```

> **Scope Note**: 12-draft sanity check on drafts written alongside the rulebook; not a general accuracy figure; larger test set planned.

### Results on 12-Draft Benchmark (`seed/results.json`)
- **Total Drafts Evaluated**: 12 (6 flawed, 6 clean)
- **True Positives**: 14 / 14
- **False Positives**: 0
- **False Negatives**: 0
- **Precision**: 100.0%
- **Recall**: 100.0%
- **F1 Score**: 100.0%

---

## 9. How to Try BrandSure

1. Open the deployed application link (or `http://localhost:3000`).
2. Self sign-up is open at `/signup` to register a **Creator** account and test the full drafting, AI compliance review, and submission flow.
3. Pre-configured test accounts for Reviewer, Manager, and Admin roles are provided in the submitted evaluation PDF.

---

## 10. Disclosures & Attributions

### External Services
- **Google Gemini API**: Utilized for semantic claim evaluation (`gemini-2.5-flash`) and vector embeddings (`text-embedding-004`).
- **Supabase**: PostgreSQL database provider offering `pgvector`, Row Level Security, and transaction logging.
- **Vercel**: Edge hosting and serverless deployment platform.

### Open-Source Libraries
- **Next.js & React**: Core web framework and reactive component model.
- **Tailwind CSS**: Utility-first CSS design system.
- **Lucide Icons**: Accessible UI icon library.
- **diff**: Version comparison and text delta calculation.
- **Zod**: Declarative data modeling and schema validation.
- **Sonner**: Accessible toast notification system.

### AI Assistance Disclosure
Portions of the BrandSure codebase, architectural scaffolding, and benchmark scripts were developed with the assistance of **Google Antigravity**, an agentic AI pair programming tool. All design decisions, security bounding rules, regulatory compliance mappings, and quality checks were reviewed and verified by the development team.

### Fictional Data Disclosure
The brand **PayNest**, along with all associated metrics (e.g., 1.2M registered members, 2x speed benchmarks, 4 partner banks), marketing drafts, and corporate scenarios, is entirely fictional and was crafted exclusively for evaluation purposes in the CodeNexus India 2026 hackathon.
