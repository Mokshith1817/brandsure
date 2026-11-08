import React from 'react';
import Link from 'next/link';
import { Database, AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react';

interface DatabaseNotConfiguredProps {
  pageName?: string;
}

export function DatabaseNotConfigured({ pageName = 'This feature' }: DatabaseNotConfiguredProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-800/90 border border-amber-500/30 rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-md">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 mx-auto sm:mx-0">
          <Database className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Production Gate Active</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Database not configured
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {pageName} requires a configured, live Supabase PostgreSQL database. In production, BrandSure enforces data persistence, Row-Level Security, and append-only audit logging. In-memory fallback is strictly disabled in production to prevent silent data loss.
        </p>

        <div className="bg-slate-950/70 border border-slate-700/60 rounded-xl p-4 mb-6 font-mono text-xs text-slate-300 space-y-2">
          <div className="text-slate-400 font-sans font-medium text-[11px] uppercase tracking-wider mb-1">
            Required Environment Variables
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span>NEXT_PUBLIC_SUPABASE_URL</span>
            <span className="text-red-400 font-sans text-[11px] font-semibold">Missing</span>
          </div>
          <div className="flex items-center justify-between text-slate-200">
            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            <span className="text-red-400 font-sans text-[11px] font-semibold">Missing</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/demo-guide"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>How BrandSure works</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
