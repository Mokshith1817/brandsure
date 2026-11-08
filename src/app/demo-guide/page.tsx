import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, UserCheck, Key, ListOrdered, Copy, FileText } from 'lucide-react';

export default function DemoGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                BrandSure: Judge & Evaluator Demo Guide
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                CodeNexus India 2026 — Fictional demo brand: <strong>PayNest</strong>
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>Go to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Architecture & Security Notice */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-bold text-indigo-900 uppercase tracking-wide text-[10px] bg-indigo-100/80 px-2 py-0.5 rounded">Data Store &amp; Security Architecture</span>
            <p className="text-slate-700 leading-relaxed">
              Production operates strictly against <strong>Supabase PostgreSQL</strong> with <code className="font-mono bg-white/80 px-1 py-0.5 rounded">pgvector</code> and append-only trigger <code className="font-mono bg-white/80 px-1 py-0.5 rounded">trg_audit_log_append_only</code>. For local evaluator testing, setting <code className="font-mono bg-white/80 px-1 py-0.5 rounded">DEMO_MODE=true</code> enables the pre-loaded in-memory store with cryptographically signed HMAC-SHA256 session cookies.
            </p>
          </div>
          <Link
            href="/about-ai"
            className="flex-shrink-0 text-indigo-700 hover:text-indigo-800 font-semibold underline text-xs"
          >
            View AI &amp; Security Disclosure &rarr;
          </Link>
        </div>

        {/* 1. Four Demo Accounts */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">1. Four Demo Accounts (All Password: <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">PayNest2026!</code>)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                Creator
              </span>
              <div className="font-mono text-xs text-slate-800 font-semibold pt-1">creator@paynest.demo</div>
              <p className="text-[11px] text-slate-500">Submits drafts, reviews findings, accepts/edits fixes, and resubmits.</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase">
                Reviewer
              </span>
              <div className="font-mono text-xs text-slate-800 font-semibold pt-1">reviewer@paynest.demo</div>
              <p className="text-[11px] text-slate-500">Inspects drafts with findings history and adds editorial comments.</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Manager
              </span>
              <div className="font-mono text-xs text-slate-800 font-semibold pt-1">manager@paynest.demo</div>
              <p className="text-[11px] text-slate-500">Approves or rejects with mandatory reason; views audit log.</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                Admin
              </span>
              <div className="font-mono text-xs text-slate-800 font-semibold pt-1">admin@paynest.demo</div>
              <p className="text-[11px] text-slate-500">Manages guidelines, facts, glossary, vector re-indexing, and audits.</p>
            </div>
          </div>
        </section>

        {/* 2. Numbered 8-Step Core Workflow Walkthrough */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ListOrdered className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">2. Complete 8-Step Journey Walkthrough</h2>
          </div>

          <ol className="space-y-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">1</span>
              <div><strong>Admin sets ground truth:</strong> Log in as <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">admin@paynest.demo</code> to review or add brand guidelines, approved facts, and preferred terms.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">2</span>
              <div><strong>Creator submits draft:</strong> Switch to <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">creator@paynest.demo</code>, click <em>New Draft</em>, select a channel (social, email, ad, blog), paste draft text, and click <em>Run Check</em>.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">3</span>
              <div><strong>Bounded agent executes checks:</strong> The agent runs hybrid retrieval: exact lookup for numbers/fees, vector similarity (pgvector) + FTS for guidelines, and deterministic glossary checks.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">4</span>
              <div><strong>Findings displayed with citations:</strong> Each finding shows severity, reason, an expandable source citation, and an intent-preserving fix labeled <em>AI-generated suggestion</em>.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">5</span>
              <div><strong>Creator takes action:</strong> Creator accepts the fix (applying it), edits it inline, or dismisses it with a required reason. A new version is saved.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">6</span>
              <div><strong>Submit for review:</strong> Creator submits the revised draft to the review queue.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">7</span>
              <div><strong>Reviewer comments & Manager approves:</strong> Reviewer inspects diff history and adds comments. Manager reviews and approves or requests changes with a written justification.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">8</span>
              <div><strong>Append-only audit log:</strong> Enforced by Postgres row-level trigger (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-indigo-700">trg_audit_log_append_only</code>) in production; in-memory log in demo mode. Every agent evaluation, finding disposition, and managerial decision is recorded with actor metadata and timestamp.</div>
            </li>
          </ol>
        </section>

        {/* 3. Sample Drafts to Copy and Test */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">3. Sample Drafts to Copy & Test</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Sample A: Flawed Social Draft (Guaranteed returns + Superlative)</span>
                <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">2 Expected Flags</span>
              </div>
              <blockquote className="p-2.5 bg-white border border-slate-200 rounded font-mono text-xs text-slate-900 select-all">
                Our app is the fastest in India, guaranteed to double your savings!
              </blockquote>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Sample B: Flawed Ad Copy (Outdated metric + Banned term)</span>
                <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">2 Expected Flags</span>
              </div>
              <blockquote className="p-2.5 bg-white border border-slate-200 rounded font-mono text-xs text-slate-900 select-all">
                Over 5 million customers rely on PayNest for zero transaction fee payments every day.
              </blockquote>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Sample C: Clean Social Draft (Compliant fact statement)</span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">0 Flags (Clean)</span>
              </div>
              <blockquote className="p-2.5 bg-white border border-slate-200 rounded font-mono text-xs text-slate-900 select-all">
                Send money to your family and friends with PayNest. All UPI payments carry zero fees for our members.
              </blockquote>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
