'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpAction } from '@/app/actions/auth';
import { ShieldCheck, ArrowRight, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUpAction({
        fullName,
        email,
        password,
        confirmPassword,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success('Account created successfully! Welcome to BrandSure.');
      router.push(res.redirect || '/drafts');
      router.refresh();
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during registration.';
      setErrorMessage(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-[420px]">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-7 h-7" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create an Account
          </h1>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Join the PayNest compliance workspace as a content creator.
          </p>
        </div>

        {/* Card */}
        <div className="mt-6 bg-white py-8 px-6 shadow-xs border border-slate-200 rounded-xl sm:px-8">
          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed font-medium"
            >
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
                Full name
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Work email address
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
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
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password (min 8 characters)
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700">
                Confirm password
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create creator account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Quiet Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 space-x-3">
          <Link href="/demo-guide" className="hover:text-slate-600 transition-colors">
            How BrandSure works
          </Link>
          <span>•</span>
          <Link href="/about-ai" className="hover:text-slate-600 transition-colors">
            AI use &amp; disclosure
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
