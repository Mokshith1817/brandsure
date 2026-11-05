'use client';

import React from 'react';
import Link from 'next/link';
import { SHOWCASE_CONTENT } from './content';
import { ShieldCheck, Lock, ArrowUp } from 'lucide-react';
import { scrollManager } from './scroll';

export const Footer: React.FC = () => {
  return (
    <footer className="relative py-12 px-6 md:px-14 bg-void border-t border-borderMuted font-mono text-xs text-regolith/60">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-earth" />
          <div>
            <span className="text-white font-display font-semibold text-sm">
              {SHOWCASE_CONTENT.brand.name}
            </span>
            <span className="text-regolith/50 text-[11px] block">
              {SHOWCASE_CONTENT.brand.hackathon}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[11px]">
          <Link href="/login" className="hover:text-white transition-colors">
            App Login
          </Link>
          <Link href="/demo-guide" className="hover:text-white transition-colors">
            Demo Guide
          </Link>
          <Link href="/about-ai" className="hover:text-white transition-colors">
            AI Disclosure
          </Link>
          <Link href="/rules" className="hover:text-white transition-colors">
            Brand Rules
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-complianceGreen" />
            <span>Audit Anchor:</span>
            <span className="text-earth font-mono">
              {SHOWCASE_CONTENT.brand.sha256Audit.slice(0, 16)}...
            </span>
          </div>
          <button
            onClick={() => scrollManager.scrollTo(0)}
            className="p-2 rounded bg-borderMuted hover:bg-borderActive text-regolith/80 hover:text-white transition-colors"
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-borderMuted/40 text-center text-[10px] text-regolith/40">
        Humans decide. AI only flags & suggests. Never invent a rule or fact.
      </div>
    </footer>
  );
};
