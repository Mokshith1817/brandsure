# BrandSure: Production Deployment Guide

This guide details the steps to deploy BrandSure to **Supabase** (PostgreSQL with `pgvector`) and **Vercel** (Next.js 15 App Router).

---

## 1. Supabase Setup (Database & Vector Store)

1. **Create a Supabase Project**:
   - Go to [database.new](https://database.new) and create a new project.
   - Choose a region closest to your users (e.g., `ap-south-1` for Mumbai, India).
   - Copy the Project URL, Anon Key, and Service Role Key from **Project Settings $\rightarrow$ API**.

2. **Execute Database Migrations**:
   - Open the **SQL Editor** in your Supabase Dashboard.
   - Paste the contents of `supabase/migrations/20261105000000_init_brandsure.sql` and click **Run**.
   - This sets up:
     - `vector` extension (pgvector).
     - Domain tables: `organisations`, `profiles`, `guidelines`, `facts`, `glossary`, `drafts`, `draft_versions`, `findings`, `comments`, `decisions`, `audit_log`, `guideline_chunks`, `agent_runs`.
     - Append-only trigger: `trg_audit_log_append_only` preventing all `UPDATE` and `DELETE` on `audit_log`.
     - HNSW cosine index on `guideline_chunks.embedding` and GIN index on `guideline_chunks.tsv`.
     - Row Level Security (RLS) policies.

3. **Seed Initial Demo Data & Vector Embeddings**:
   - Set up your `.env.local` locally with your live Supabase credentials and Gemini API key:
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
     SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
     GEMINI_API_KEY=<your-google-gemini-api-key>
     ```
   - Run the seed script:
     ```bash
     npm run seed
     ```
   - This seeds the demo organization (PayNest), demo user accounts, guideline chunks with 768-dimensional vector embeddings, approved facts, and baseline drafts.

---

## 2. Vercel Deployment

1. **Import Repository**:
   - Push your code to GitHub.
   - In Vercel, click **Add New... $\rightarrow$ Project** and select your repository.
   - Framework Preset: **Next.js**.

2. **Configure Environment Variables in Vercel**:
   Add the following variables under **Settings $\rightarrow$ Environment Variables**:

   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-id>.supabase.co` | Live Supabase endpoint |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Service Role key (Server-only) |
   | `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API key (Server-only) |
   | `GEMINI_MODEL` | `gemini-2.5-flash` | LLM inference model |
   | `GEMINI_EMBEDDING_MODEL` | `text-embedding-004` | 768-dim embedding model |
   | `SESSION_SECRET` | 32-byte hex string | HMAC session key (`openssl rand -hex 32`) |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-project>.vercel.app` | Production app domain |

3. **Deploy**:
   - Click **Deploy**.
   - Build command: `next build` (clean exit code 0).
   - Once deployed, your production URL will be live.

---

## 3. Production Verification Checklist

1. **Database Connection Gate**:
   - Navigate to `/drafts`.
   - Verify footer displays: `Data store: Supabase`.
   - Top banner should be hidden (no "Demo mode" banner).
2. **Review Workspace**:
   - Open `/drafts/new` and submit marketing copy.
   - Verify findings are generated, cited, and displayed with suggested fixes.
3. **Role Security**:
   - Verify creator cannot approve/reject.
   - Verify manager approval requires written justification.
4. **Append-Only Audit Log**:
   - Verify `/audit` logs all evaluations and decisions with timestamp.
