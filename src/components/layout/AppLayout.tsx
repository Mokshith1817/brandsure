'use client';

import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import type { Role } from '@/types/database';
import { AlertTriangle, Database } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail: string;
  fullName: string;
  role: Role;
  orgName?: string;
  isDemoMode?: boolean;
}

export function AppLayout({
  children,
  userEmail,
  fullName,
  role,
  orgName = 'PayNest',
  isDemoMode = false,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* Persistent Demo Mode Banner */}
      {isDemoMode && (
        <aside
          role="status"
          aria-label="Demo mode status notice"
          className="bg-amber-400 text-slate-950 font-semibold px-4 py-2 text-xs text-center flex items-center justify-center gap-2 border-b border-amber-500 shadow-xs shrink-0"
        >
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" aria-hidden="true" />
          <span>Demo mode: data is temporary and resets</span>
        </aside>
      )}

      <TopBar
        userEmail={userEmail}
        fullName={fullName}
        role={role}
        orgName={orgName}
      />

      <div className="flex-1 flex">
        <Sidebar role={role} />
        <main className="flex-1 p-6 md:p-8 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Data Store Status Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="font-semibold text-slate-800">BrandSure</span>
          <span>&bull;</span>
          <span>PayNest Brand Governance</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-slate-700">
          <Database className="w-3 h-3 text-slate-500" aria-hidden="true" />
          <span>{isDemoMode ? 'Data store: Demo mode' : 'Data store: Supabase'}</span>
        </div>
      </footer>
    </div>
  );
}
