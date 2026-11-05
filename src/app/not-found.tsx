import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-5 animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">404 Error</span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Page Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or draft resource you requested could not be located or may have moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors tap-target-44"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <Link
            href="/demo-guide"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors tap-target-44"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Demo Guide</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
