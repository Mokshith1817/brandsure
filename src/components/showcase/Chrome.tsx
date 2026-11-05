'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Activity, Terminal, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';
import { SHOWCASE_CONTENT } from './content';

export const Chrome: React.FC = () => {
  const [blockHeight, setBlockHeight] = useState(8941);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlockHeight((h) => h + Math.floor(Math.random() * 2) + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-borderMuted/80 bg-void/85 backdrop-blur-md transition-all duration-300">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <Link href="/showcase" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-indigoBrand/20 border border-indigoBrand/50 shadow-[0_0_15px_rgba(79,70,229,0.3)] group-hover:border-earth transition-colors">
            <ShieldCheck className="w-5 h-5 text-earth" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-complianceGreen opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-complianceGreen"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-widest text-white">
                {SHOWCASE_CONTENT.brand.name}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-earth/10 text-earth border border-earth/20 font-medium">
                Round 2 Build
              </span>
            </div>
            <p className="text-[11px] text-regolith/60 font-mono">
              Demo Brand: {SHOWCASE_CONTENT.brand.client} · CodeNexus India 2026
            </p>
          </div>
        </Link>
      </div>

      {/* Live Telemetry Ticker */}
      <div className="hidden lg:flex items-center gap-6 font-mono text-xs">
        <div className="flex items-center gap-2 text-regolith/80">
          <Activity className="w-3.5 h-3.5 text-complianceGreen" />
          <span>F1 Score:</span>
          <span className="text-white font-medium">{SHOWCASE_CONTENT.telemetry.f1}</span>
        </div>
        <div className="h-3 w-px bg-borderMuted"></div>
        <div className="flex items-center gap-2 text-regolith/80">
          <Terminal className="w-3.5 h-3.5 text-earth" />
          <span>Audit Block:</span>
          <span className="text-earth font-mono">#{blockHeight}</span>
        </div>
        <div className="h-3 w-px bg-borderMuted"></div>
        <div className="flex items-center gap-2 text-regolith/80">
          <span className="w-2 h-2 rounded-full bg-indigoBrand"></span>
          <span>Bounded RAG:</span>
          <span className="text-white">Strict Closed-World</span>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex items-center gap-3">
        <Link
          href="/demo-guide"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md text-regolith/80 hover:text-white hover:bg-borderMuted/40 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-earth" />
          <span>Demo Guide</span>
        </Link>

        <a
          href="#sandbox"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md bg-void border border-borderActive hover:border-earth text-regolith hover:text-white transition-colors"
        >
          <span>Sandbox</span>
          <ExternalLink className="w-3 h-3 text-earth" />
        </a>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-semibold rounded-md bg-indigoBrand hover:bg-indigoBrand/80 text-white border border-indigoBrand/60 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
        >
          <span>Enter App</span>
          <ArrowRight className="w-3.5 h-3.5 text-earth" />
        </Link>
      </div>
    </header>
  );
};
