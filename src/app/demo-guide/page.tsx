import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, UserCheck, ListOrdered, FileText, Info } from 'lucide-react';

export default function HowBrandSureWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                How BrandSure Works
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-publication brand governance. Note: <strong>PayNest</strong> is a fictional sample organization; all guidelines and facts are sample demonstration data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              <span>Create account</span>
            </Link>
          </div>
        </div>

        {/* Purpose & Architecture Notice */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5 text-xs text-indigo-950 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-900 uppercase tracking-wide text-[10px] bg-indigo-100/80 px-2 py-0.5 rounded">
              Purpose &amp; Governance Model
            </span>
            <Link
              href="/about-ai"
              className="text-indigo-700 hover:text-indigo-900 font-semibold underline text-xs"
            >
              AI Disclosure &rarr;
            </Link>
          </div>
          <p className="text-slate-700 leading-relaxed">
            BrandSure helps marketing and communications teams verify pre-publication content against approved internal guidelines, verified operational facts, and preferred brand terminology before copy reaches customers. Production runs strictly against <strong>Supabase PostgreSQL</strong> with <code className="font-mono bg-white/80 px-1 py-0.5 rounded">pgvector</code>, Row-Level Security, and an append-only audit trigger (<code className="font-mono bg-white/80 px-1 py-0.5 rounded">trg_audit_log_append_only</code>).
          </p>
        </div>

        {/* 1. Four Governance Roles */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">1. Four Governance Roles</h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluators can sign up for a new <strong>Creator</strong> account directly at <Link href="/signup" className="text-indigo-600 underline font-semibold">/signup</Link>. Pre-configured accounts for Reviewer, Manager, and Admin roles are provided in the submitted evaluation PDF.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                Creator
              </span>
              <p className="text-[11px] text-slate-600 pt-1">
                Authors drafts, runs compliance checks, reviews AI findings, applies or dismisses fixes with reasons, and submits for team review.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase">
                Reviewer
              </span>
              <p className="text-[11px] text-slate-600 pt-1">
                Inspects incoming drafts in the review queue, verifies multi-version diffs, and contributes contextual editorial commentary.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                Manager
              </span>
              <p className="text-[11px] text-slate-600 pt-1">
                Holds final decision authority to Approve, Request Changes, or Reject with a mandatory written justification.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                Admin
              </span>
              <p className="text-[11px] text-slate-600 pt-1">
                Manages brand guidelines, operational facts, glossary terms, vector embedding re-indexing, and inspects the append-only audit trail.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Numbered 8-Step Core Workflow Walkthrough */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ListOrdered className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">2. Complete 8-Step Core Workflow</h2>
          </div>

          <ol className="space-y-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">1</span>
              <div><strong>Admin sets ground truth:</strong> Sign in with an Admin account. Navigate to <Link href="/rules" className="text-indigo-600 underline font-semibold">/rules</Link> to inspect active guidelines, verified facts, and glossary entries.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">2</span>
              <div><strong>Creator submits draft:</strong> Sign in as a Creator (or self sign-up at <Link href="/signup" className="text-indigo-600 underline font-semibold">/signup</Link>). Click <em>New Draft</em>, choose a channel (social, email, ad, blog), paste copy, and click <em>Run Check</em>.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">3</span>
              <div><strong>Bounded agent executes checks:</strong> The agent executes hybrid retrieval: exact lookup for numbers/fees, vector similarity (pgvector) + full-text search for guidelines, and deterministic glossary checks.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">4</span>
              <div><strong>Findings displayed with citations:</strong> Each finding highlights offending text with category, severity, reason, an expandable source citation, and an intent-preserving fix labeled <em>AI-generated suggestion</em>.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">5</span>
              <div><strong>Creator takes action:</strong> Creator accepts the fix (applying it into text), edits it inline, or dismisses it with a mandatory written justification. A new version is saved.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">6</span>
              <div><strong>Submit for review:</strong> Creator submits the revised draft to the review queue. The system enforces that no High-severity finding remains unaddressed.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">7</span>
              <div><strong>Reviewer comments & Manager decides:</strong> Reviewer inspects diff history and adds comments. Manager reviews and approves, requests changes, or rejects with a mandatory written reason.</div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">8</span>
              <div><strong>Append-only audit trail:</strong> Enforced by Postgres row-level trigger (<code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-indigo-700">trg_audit_log_append_only</code>) in production. Every agent evaluation, finding disposition, and managerial decision is recorded chronologically.</div>
            </li>
          </ol>
        </section>

        {/* 3. Sample Drafts to Copy and Test */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">3. Sample Drafts to Copy &amp; Test</h2>
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

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 space-x-3 pt-4">
          <Link href="/about-ai" className="hover:text-slate-600 transition-colors">
            AI use &amp; disclosure
          </Link>
          <span>•</span>
          <Link href="/rules" className="hover:text-slate-600 transition-colors">
            Brand rulebook
          </Link>
          <span>•</span>
          <a
            href="https://github.com/Mokshith1817/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 transition-colors"
          >
            Repository
          </a>
        </div>
      </div>
    </div>
  );
}
