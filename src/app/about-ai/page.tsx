import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Bot, Lock, Eye, AlertTriangle, FileCheck, Database } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/data-store';

export default function AboutAIPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI & External Services Disclosure</h1>
              <p className="text-xs text-slate-500">
                Transparency on model providers, data handling, and human control boundaries.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                1. Core Governance Principle: Humans Decide
              </h2>
              <p>
                In BrandSure, artificial intelligence is strictly constrained to a <strong>read, flag, and suggest</strong> role. The AI can <strong>never approve, reject, publish, or overwrite</strong> any creator&apos;s copy. All publishing decisions, review verdicts, and final edits are made exclusively by authenticated human stakeholders (Creators, Reviewers, and Managers).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                2. AI Models and Services Used
              </h2>
              <p>
                BrandSure integrates with the <strong>Google Gemini API</strong> for semantic evaluation:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li><strong>LLM Inference:</strong> Configured via environment variable <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">GEMINI_MODEL</code> (default: Gemini 2.5 Flash) for claim extraction, rule-context judging, and intent-preserving rewrite suggestions.</li>
                <li><strong>Vector Embeddings:</strong> Configured via <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">GEMINI_EMBEDDING_MODEL</code> (text-embedding-004, 768 dimensions) for indexing guideline rule chunks into <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">pgvector</code>.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                3. Privacy and Data Transferred
              </h2>
              <p>
                To protect confidentiality, BrandSure never sends entire brand document libraries or user account data to external models. The only information passed to the Gemini API is:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>The specific text snippet or draft submitted for review.</li>
                <li>The targeted rule chunks retrieved via hybrid search (vector similarity + full-text search).</li>
                <li>Approved factual rows relevant to the extracted claims.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                4. Grounding and Anti-Hallucination Policy
              </h2>
              <p>
                If no approved source supports a verdict, the system explicitly outputs <strong>&ldquo;No approved source found&rdquo;</strong> instead of inventing an answer or making up facts. Furthermore, every suggested fix is re-evaluated by a verification step before being presented to the creator.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                5. Demonstration Data Notice
              </h2>
              <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
                All demonstration companies, figures, and scenarios (including the demo brand <strong>PayNest</strong>, its user counts, speed benchmarks, and partner banks) are entirely fictional and designed for evaluation purposes in the CodeNexus India 2026 hackathon.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                6. Data Store Architecture & Integrity
              </h2>
              <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Active Architecture:</span>
                  <span className="font-mono font-semibold px-2.5 py-0.5 rounded text-[11px] bg-slate-200 text-slate-800">
                    {isSupabaseConfigured() ? 'Data store: Supabase' : 'Data store: Demo mode'}
                  </span>
                </div>
                <p>
                  In production, BrandSure operates exclusively with Supabase PostgreSQL, enforcing Row-Level Security and database triggers. In-memory demo storage is restricted to local development environments when <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-700">DEMO_MODE=true</code> is set.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
