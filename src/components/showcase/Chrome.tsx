'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { SHOWCASE_CONTENT } from './content';

export const Chrome: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b border-borderMuted bg-void/90 backdrop-blur-sm transition-colors">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <Link href="/showcase" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigoBrand/20 border border-indigoBrand/50 shadow-sm group-hover:border-earth transition-colors">
            <ShieldCheck className="w-5 h-5 text-earth" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm tracking-widest text-white font-normal">
                {SHOWCASE_CONTENT.brand.name}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-earth/10 text-earth border border-earth/20 font-medium">
                Round 2
              </span>
            </div>
            <p className="text-[11px] text-regolith/60 font-mono">
              Demo Brand: {SHOWCASE_CONTENT.brand.client}
            </p>
          </div>
        </Link>
      </div>

      {/* Honest Telemetry Indicators */}
      <div className="hidden lg:flex items-center gap-6 font-mono text-xs">
        <div className="flex items-center gap-2 text-regolith/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-complianceGreen" />
          <span>Sanity Benchmark:</span>
          <span className="text-white font-medium">12 / 12 Drafts Verified</span>
        </div>
        <div className="h-3 w-px bg-borderMuted"></div>
        <div className="flex items-center gap-2 text-regolith/80">
          <span className="w-2 h-2 rounded-full bg-indigoBrand"></span>
          <span>Bounded RAG:</span>
          <span className="text-white">Grounded Citations Only</span>
        </div>
        <div className="h-3 w-px bg-borderMuted"></div>
        <div className="text-[11px] text-regolith/60">
          Humans decide. AI only flags & suggests.
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/demo-guide"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md text-regolith hover:text-white hover:bg-borderMuted/60 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-earth" />
          <span>Demo Guide</span>
        </Link>

        <a
          href="#sandbox"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-void border border-borderActive hover:border-earth text-regolith hover:text-white transition-colors"
        >
          <span>Interactive Sandbox</span>
        </a>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-semibold rounded-md bg-indigoBrand hover:bg-indigoBrand/80 text-white border border-indigoBrand/60 shadow-sm transition-all"
        >
          <span>Enter App</span>
          <ArrowRight className="w-3.5 h-3.5 text-earth" />
        </Link>
      </div>
    </header>
  );
};
