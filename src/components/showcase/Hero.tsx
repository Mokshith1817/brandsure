'use client';

import React, { useEffect, useRef } from 'react';
import { onFrame } from './scroll';
import { pinProgress, range } from './math';
import { SHOWCASE_CONTENT } from './content';
import { Shield, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = -1;

    return onFrame(() => {
      const root = containerRef.current;
      if (!root) return;

      const { p, rect, vh } = pinProgress(root);

      // Off-screen guard & unchanged guard (R6)
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - last) < 0.0005) return;
      last = p;

      // L2: Distant rings slight parallax
      if (ringsRef.current) {
        const ringY = p * 60;
        ringsRef.current.style.transform = `translate3d(0, ${ringY.toFixed(1)}px, 0)`;
      }

      // L3: Claim cloud disperses and fades out between 0.0 -> 0.28
      if (cloudRef.current) {
        const cloudProg = range(p, 0.0, 0.28);
        const cloudOpacity = 1 - cloudProg;
        const cloudScale = 1 + cloudProg * 0.25;
        const cloudY = -cloudProg * 40;
        cloudRef.current.style.opacity = cloudOpacity.toFixed(3);
        cloudRef.current.style.transform = `translate3d(0, ${cloudY.toFixed(1)}px, 0) scale(${cloudScale.toFixed(3)})`;
        cloudRef.current.style.pointerEvents = cloudOpacity < 0.05 ? 'none' : 'auto';
      }

      // L4: Brand Shield rises from below horizon between 0.08 -> 0.70
      if (shieldRef.current) {
        const shieldProg = range(p, 0.08, 0.70);
        const translateY = (1 - shieldProg) * 100; // 100px up to 0
        const scale = 0.82 + shieldProg * 0.24;
        const opacity = range(p, 0.04, 0.35);
        shieldRef.current.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        shieldRef.current.style.opacity = opacity.toFixed(3);
      }

      // L5: Title reveals cleanly
      if (titleRef.current) {
        const titleProg = range(p, 0.15, 0.75);
        const titleY = (1 - titleProg) * 35;
        const titleOpacity = range(p, 0.12, 0.45);
        titleRef.current.style.transform = `translate3d(0, ${titleY.toFixed(1)}px, 0)`;
        titleRef.current.style.opacity = titleOpacity.toFixed(3);
      }

      // L6: Telemetry HUD fades in after claims clear (0.32 -> 0.80)
      if (hudRef.current) {
        const hudOpacity = range(p, 0.32, 0.80);
        hudRef.current.style.opacity = hudOpacity.toFixed(3);
      }

      // Scroll Prompt fades out on initial scroll (0.0 -> 0.12)
      if (promptRef.current) {
        const promptOpacity = 1 - range(p, 0.0, 0.12);
        promptRef.current.style.opacity = promptOpacity.toFixed(3);
      }
    });
  }, []);

  return (
    <section ref={containerRef} className="relative h-[220svh] bg-void">
      {/* Pinned Stage Container (100svh - R8) */}
      <div className="sticky top-0 h-screen-s w-full overflow-hidden flex flex-col justify-between p-6 md:p-12 select-none vault-grid">
        {/* L1: Background Gradient & Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-void via-[#0a0f1d] to-void pointer-events-none" />
        <div className="absolute inset-0 vault-radial pointer-events-none opacity-80" />

        {/* L2: Distant Rings (Subtle Parallax) */}
        <div
          ref={ringsRef}
          data-scroll-driven
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25"
        >
          <div className="w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full border border-indigoBrand/30" />
          <div className="w-[900px] h-[900px] md:w-[1300px] md:h-[1300px] rounded-full border border-earth/20" />
        </div>

        {/* TOP STATUS / BRAND EYEBROW */}
        <div className="relative z-10 pt-14 text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigoBrand/15 border border-indigoBrand/30 text-earth text-[11px] font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-complianceGreen"></span>
            {SHOWCASE_CONTENT.hero.eyebrow}
          </div>
        </div>

        {/* L3: Floating Risky Marketing Claim Cloud (Visible at frame 0, clears on scroll) */}
        <div
          ref={cloudRef}
          data-scroll-driven
          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 pointer-events-auto"
        >
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-alertAmber/15 border border-alertAmber/40 text-alertAmber text-xs font-mono font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>UNGROUNDED MARKETING CLAIMS IN PRODUCTION</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display text-white font-normal tracking-wide">
              Marketing copy often overreaches.
            </h2>
            <p className="text-xs md:text-sm text-regolith/80 font-sans max-w-xl mx-auto leading-relaxed">
              Without automated ground-truth checks, prohibited superlatives and unverified statistics slip into live campaigns.
            </p>
          </div>

          {/* Floating Claim Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl w-full">
            {SHOWCASE_CONTENT.hero.riskClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-3 rounded-xl bg-void/90 border border-hazardRed/30 shadow-sm flex flex-col justify-between gap-1.5 hover:border-hazardRed/60 transition-colors"
              >
                <span className="text-[9px] font-mono uppercase text-hazardRed tracking-wider font-semibold">
                  {claim.tag}
                </span>
                <span className="text-xs font-sans font-medium text-white line-through decoration-hazardRed/80">
                  "{claim.text}"
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2 text-earth font-mono text-xs tracking-wider">
            <span>SCROLL TO ENGAGE BOUNDED VERIFICATION</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-earth" />
          </div>
        </div>

        {/* L4: Center Brand Shield (PayNest Truth Core) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            ref={shieldRef}
            data-scroll-driven
            className="relative flex flex-col items-center justify-center opacity-0"
          >
            {/* Clean pre-made radial glow background (no GPU blur filters - R5) */}
            <div className="absolute -inset-10 bg-radial-glow rounded-full opacity-60 pointer-events-none" />
            <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-[#090d18] border border-earth/40 flex items-center justify-center shadow-lg">
              <Shield className="w-16 h-16 md:w-24 md:h-24 text-earth" />
              <div className="absolute -bottom-3 px-3 py-0.5 bg-void border border-earth/60 rounded-full text-[9px] font-mono text-earth tracking-widest uppercase">
                Approved Truth
              </div>
            </div>
          </div>
        </div>

        {/* L5: Title & Lead Text */}
        <div
          ref={titleRef}
          data-scroll-driven
          className="relative z-20 text-center max-w-3xl mx-auto space-y-3 opacity-0"
        >
          <h1 className="text-4xl md:text-6xl font-display tracking-widestHero text-white font-normal uppercase">
            {SHOWCASE_CONTENT.hero.title}
          </h1>
          <p className="text-xs md:text-sm text-regolith/85 font-sans max-w-xl mx-auto leading-relaxed">
            {SHOWCASE_CONTENT.hero.lead}
          </p>
        </div>

        {/* L6: Corner Telemetry Readouts (Fades in after claims clear) */}
        <div
          ref={hudRef}
          data-scroll-driven
          className="relative z-20 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 pb-2 font-mono text-xs border-t border-borderMuted/60 bg-void/60 opacity-0"
        >
          <div className="space-y-0.5">
            <span className="text-regolith/50 text-[10px] block uppercase">Approved Sources</span>
            <div className="flex items-center gap-1.5 text-white font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-complianceGreen" />
              <span>48 Rulebook Guidelines</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-regolith/50 text-[10px] block uppercase">Fact Verification</span>
            <div className="text-earth font-medium">
              Relational Tariff & Fee Maps
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-regolith/50 text-[10px] block uppercase">Retrieval Strategy</span>
            <div className="text-white font-medium">
              pgvector + Full-Text Search
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-regolith/50 text-[10px] block uppercase">Human Disintermediation</span>
            <div className="text-complianceGreen font-medium">
              Zero (Reviewer Decides)
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div
          ref={promptRef}
          data-scroll-driven
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 font-mono text-[10px] text-regolith/60 tracking-widest uppercase"
        >
          <span>{SHOWCASE_CONTENT.hero.scrollPrompt}</span>
          <ChevronDown className="w-3.5 h-3.5 text-earth animate-bounce" />
        </div>
      </div>
    </section>
  );
};
