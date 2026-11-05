'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Role } from '@/types/database';
import { ShieldCheck, LogOut, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import { logoutAction } from '@/app/actions/auth';

interface TopBarProps {
  userEmail: string;
  fullName: string;
  role: Role;
  orgName?: string;
}

export function TopBar({
  userEmail,
  fullName,
  role,
  orgName = 'PayNest',
}: TopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch {
      router.push('/login');
    }
  };

  const roleBadgeStyles: Record<Role, string> = {
    creator: 'bg-blue-50 text-blue-700 border-blue-200',
    reviewer: 'bg-purple-50 text-purple-700 border-purple-200',
    manager: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    admin: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Organization */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 tracking-tight text-lg">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <span>BrandSure</span>
        </Link>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>{orgName}</span>
        </div>
      </div>

      {/* User info, Role Badge, and Actions */}
      <div className="flex items-center gap-4">
        {/* Role badge */}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${roleBadgeStyles[role] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
          {role}
        </span>

        {/* User name & email */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-800">{fullName || 'Demo User'}</span>
          <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{userEmail}</span>
        </div>

        {/* Logout action */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 p-2 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="Sign out of BrandSure"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
