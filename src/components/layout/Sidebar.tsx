'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/types/database';
import {
  FileText,
  PlusCircle,
  CheckSquare,
  ShieldAlert,
  BookOpen,
  Database,
  Type,
  ClipboardList,
  Info,
  Layers,
  Compass,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  role: Role;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = (currentRole: Role): NavItem[] => {
    switch (currentRole) {
      case 'creator':
        return [
          { label: 'My Drafts', href: '/drafts', icon: FileText },
          { label: 'New Draft', href: '/drafts/new', icon: PlusCircle },
          { label: 'Rulebook & Facts', href: '/rules', icon: BookOpen },
          { label: 'Showcase UI', href: '/showcase', icon: Sparkles },
          { label: 'How BrandSure works', href: '/demo-guide', icon: Compass },
          { label: 'About AI Governance', href: '/about-ai', icon: Info },
        ];
      case 'reviewer':
        return [
          { label: 'Review Queue', href: '/reviews', icon: CheckSquare },
          { label: 'All Drafts', href: '/drafts', icon: FileText },
          { label: 'Rulebook & Facts', href: '/rules', icon: BookOpen },
          { label: 'Showcase UI', href: '/showcase', icon: Sparkles },
          { label: 'How BrandSure works', href: '/demo-guide', icon: Compass },
          { label: 'About AI Governance', href: '/about-ai', icon: Info },
        ];
      case 'manager':
        return [
          { label: 'Approvals Queue', href: '/approvals', icon: ShieldAlert },
          { label: 'All Drafts', href: '/drafts', icon: FileText },
          { label: 'Audit Log', href: '/audit', icon: ClipboardList },
          { label: 'Rulebook & Facts', href: '/rules', icon: BookOpen },
          { label: 'Showcase UI', href: '/showcase', icon: Sparkles },
          { label: 'How BrandSure works', href: '/demo-guide', icon: Compass },
          { label: 'About AI Governance', href: '/about-ai', icon: Info },
        ];
      case 'admin':
        return [
          { label: 'Guidelines', href: '/admin/guidelines', icon: BookOpen },
          { label: 'Approved Facts', href: '/admin/facts', icon: Database },
          { label: 'Glossary', href: '/admin/glossary', icon: Type },
          { label: 'Audit Log', href: '/audit', icon: ClipboardList },
          { label: 'All Drafts', href: '/drafts', icon: Layers },
          { label: 'Showcase UI', href: '/showcase', icon: Sparkles },
          { label: 'How BrandSure works', href: '/demo-guide', icon: Compass },
          { label: 'About AI Governance', href: '/about-ai', icon: Info },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems(role);

  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation ({role})
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 px-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
          <p className="font-semibold text-slate-700">BrandSure v1.0</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Pre-publication governance checkpoint. AI suggests; humans decide.
          </p>
        </div>
      </div>
    </aside>
  );
}
