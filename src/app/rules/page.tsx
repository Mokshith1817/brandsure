import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppLayout } from '@/components/layout/AppLayout';
import { BookOpen, Database, Type, Check, Ban } from 'lucide-react';

import { getCurrentSession } from '@/lib/auth';
import { getDemoGuidelines, getDemoFacts, getDemoGlossary, isSupabaseConfigured } from '@/lib/demo-data';
import { DatabaseNotConfigured } from '@/components/ui/DatabaseNotConfigured';

export const dynamic = 'force-dynamic';

export default async function RulesPage() {
  const { user, profile, isDemoMode } = await getCurrentSession();

  if (!isSupabaseConfigured() && !isDemoMode) {
    return <DatabaseNotConfigured pageName="Brand Rulebook" />;
  }

  if (!user || !profile) {
    redirect('/login');
  }

  let guidelines: any[] = [];
  let facts: any[] = [];
  let glossary: any[] = [];

  if (isDemoMode) {
    guidelines = getDemoGuidelines();
    facts = getDemoFacts();
    glossary = getDemoGlossary();
  } else {
    try {
      const supabase = await createClient();
      const [guidelinesRes, factsRes, glossaryRes] = await Promise.all([
        supabase.from('guidelines').select('*').order('category', { ascending: true }),
        supabase.from('facts').select('*').order('key', { ascending: true }),
        supabase.from('glossary').select('*').order('preferred', { ascending: true }),
      ]);
      guidelines = guidelinesRes.data || [];
      facts = factsRes.data || [];
      glossary = glossaryRes.data || [];
    } catch (err: any) {
      console.error('[Supabase Rules Query Error]:', err.message);
    }
  }

  return (
    <AppLayout
      userEmail={user.email}
      fullName={profile.full_name}
      role={profile.role}
      orgName={profile.organisations?.name || 'PayNest'}
      isDemoMode={isDemoMode}
    >
      <div className="space-y-8 pb-10">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            PayNest Rulebook & Brand Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official approved guidelines, ground-truth facts, and terminology definitions used by BrandSure to evaluate pre-publication drafts.
          </p>
        </div>

        {/* Section 1: Approved Facts */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="p-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold">1. Approved Brand Facts</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">Fact Key & Statement</th>
                  <th scope="col" className="px-4 py-3 text-left">Approved Value</th>
                  <th scope="col" className="px-4 py-3 text-left">As of</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {facts.map((fact) => (
                  <tr key={fact.id}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mr-2">
                        {fact.key}
                      </span>
                      <span className="font-medium text-slate-900">{fact.statement}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-800">
                      {fact.value} <span className="font-normal text-xs text-slate-500">{fact.unit}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                      {fact.as_of}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Brand Guidelines */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="p-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold">2. Brand & Regulatory Guidelines</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {guidelines.map((g) => (
              <div key={g.id} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {g.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{g.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{g.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Brand Glossary */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="p-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg">
              <Type className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold">3. Preferred Vocabulary & Glossary</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {glossary.map((entry) => (
              <div key={entry.id} className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{entry.preferred}</span>
                  </span>
                  <span className="text-slate-400 font-semibold text-[10px]">REPLACES</span>
                  {entry.banned.map((b: string, i: number) => (
                    <span key={i} className="inline-flex items-center gap-0.5 text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded line-through text-[11px]">
                      <Ban className="w-2.5 h-2.5 text-red-500" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
                {entry.note && (
                  <p className="text-[11px] text-slate-500 italic pl-0.5">{entry.note}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
