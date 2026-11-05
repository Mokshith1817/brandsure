'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  CheckCircle2,
  BookOpen,
  UserCheck,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('creator@paynest.demo');
  const [password, setPassword] = useState('PayNest2026!');
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPassword?: string) => {
    setLoading(true);
    try {
      const res = await loginAction(loginEmail, loginPassword);
      if (res?.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success(`Welcome to BrandSure (${loginEmail})`);
      router.push(res.redirect || '/');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred during login');
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleOneClickPersona = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('PayNest2026!');
    await performLogin(demoEmail, 'PayNest2026!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative ambient background glow (pure CSS, no layout shift) */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-[300px] h-[200px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <ShieldCheck className="w-8 h-8" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          BrandSure
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Pre-publication brand governance for fintech teams. Protect your brand with citation-backed compliance checks before copy reaches customers.
        </p>

        {/* Highlighted Judge Demo & Showcase Banners */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
          <Link
            href="/showcase"
            className="inline-flex items-center gap-1.5 bg-slate-900 text-cyan-300 border border-slate-700 hover:border-cyan-400 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>Experience Cinematic Showcase</span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-cyan-950 text-cyan-300 rounded border border-cyan-800">
              New
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
            <Compass className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
            <span>Hackathon Evaluator?</span>
            <Link
              href="/demo-guide"
              className="underline underline-offset-2 hover:text-indigo-900 font-bold"
            >
              Demo Guide
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {/* Quick 1-Click Role Login for Hackathon Judges & Testers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                <span>Instant 1-Click Role Login</span>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                Click any persona to enter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Creator Card */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickPersona('creator@paynest.demo')}
                className="p-3.5 border border-slate-200 rounded-xl text-left hover:bg-indigo-50/60 hover:border-indigo-300 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500 tap-target-44"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Creator
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-semibold text-xs text-slate-900 pt-0.5">creator@paynest.demo</div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Submits drafts, reviews AI findings, and applies safer wording.
                </p>
              </button>

              {/* Reviewer Card */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickPersona('reviewer@paynest.demo')}
                className="p-3.5 border border-slate-200 rounded-xl text-left hover:bg-purple-50/60 hover:border-purple-300 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500 tap-target-44"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Reviewer
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-semibold text-xs text-slate-900 pt-0.5">reviewer@paynest.demo</div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Inspects review queue, verifies diffs, and contributes editorial comments.
                </p>
              </button>

              {/* Manager Card */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickPersona('manager@paynest.demo')}
                className="p-3.5 border border-slate-200 rounded-xl text-left hover:bg-emerald-50/60 hover:border-emerald-300 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500 tap-target-44"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Manager
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-semibold text-xs text-slate-900 pt-0.5">manager@paynest.demo</div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Makes final approval or rejection decision with mandatory reason.
                </p>
              </button>

              {/* Admin Card */}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickPersona('admin@paynest.demo')}
                className="p-3.5 border border-slate-200 rounded-xl text-left hover:bg-amber-50/60 hover:border-amber-300 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500 tap-target-44"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Admin
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-semibold text-xs text-slate-900 pt-0.5">admin@paynest.demo</div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Manages brand guidelines, facts, glossary, vectors, and audits.
                </p>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-1">
              Demo password for all personas: <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">PayNest2026!</code>
            </p>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                Or sign in manually
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@paynest.demo"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tap-target-44"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 tap-target-44"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 tap-target-44"
            >
              {loading ? 'Authenticating...' : 'Sign in to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Public Demo Guide & AI Disclosure Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <Link
            href="/demo-guide"
            className="hover:text-indigo-600 transition-colors underline underline-offset-4 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Judge Demo Guide</span>
          </Link>
          <span>•</span>
          <Link
            href="/about-ai"
            className="hover:text-indigo-600 transition-colors underline underline-offset-4"
          >
            AI Disclosure
          </Link>
          <span>•</span>
          <Link
            href="/rules"
            className="hover:text-indigo-600 transition-colors underline underline-offset-4"
          >
            Brand Rulebook
          </Link>
        </div>
      </div>
    </div>
  );
}
