'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth';
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@paynest.demo');
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-7 h-7" aria-hidden="true" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          BrandSure
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Pre-publication brand governance checkpoint for fintech content
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10 space-y-6">
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
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
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
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
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign in to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Role Login for Hackathon Judges */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Instant 1-Click Persona Login</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                Click any role to enter
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickPersona('creator@paynest.demo')}
                className="p-2.5 border border-slate-200 rounded-lg text-left hover:bg-indigo-50 hover:border-indigo-300 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-700 flex items-center justify-between">
                  <span>Creator</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600" />
                </div>
                <div className="text-[11px] text-slate-500 truncate">creator@paynest.demo</div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickPersona('reviewer@paynest.demo')}
                className="p-2.5 border border-slate-200 rounded-lg text-left hover:bg-indigo-50 hover:border-indigo-300 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-700 flex items-center justify-between">
                  <span>Reviewer</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600" />
                </div>
                <div className="text-[11px] text-slate-500 truncate">reviewer@paynest.demo</div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickPersona('manager@paynest.demo')}
                className="p-2.5 border border-slate-200 rounded-lg text-left hover:bg-indigo-50 hover:border-indigo-300 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-700 flex items-center justify-between">
                  <span>Manager</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600" />
                </div>
                <div className="text-[11px] text-slate-500 truncate">manager@paynest.demo</div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleOneClickPersona('admin@paynest.demo')}
                className="p-2.5 border border-slate-200 rounded-lg text-left hover:bg-indigo-50 hover:border-indigo-300 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-700 flex items-center justify-between">
                  <span>Admin</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600" />
                </div>
                <div className="text-[11px] text-slate-500 truncate">admin@paynest.demo</div>
              </button>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 text-center">
              Password for all accounts: <span className="font-mono text-slate-600 font-semibold">PayNest2026!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
