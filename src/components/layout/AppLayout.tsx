'use client';

import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import type { Role } from '@/types/database';

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail: string;
  fullName: string;
  role: Role;
  orgName?: string;
}

export function AppLayout({
  children,
  userEmail,
  fullName,
  role,
  orgName = 'PayNest',
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
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
    </div>
  );
}
