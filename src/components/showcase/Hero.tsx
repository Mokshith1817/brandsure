'use client';

import React, { useEffect, useRef } from 'react';
import { scrollManager } from './scroll';
import { norm, clamp } from './math';
import { SHOWCASE_CONTENT } from './content';
import { Shield, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noiseLayerRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = scrollManager.subscribe(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = containerRef.current.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, totalH));

      // 1. Noise layer clears fast (0.0 -> 0.28)
      if (noiseLayerRef.current) {
        const noiseAlpha = 1 - norm(progress, 0.0, 0.28);
        const noiseScale = 1 + norm(progress, 0.0, 0.28) * 0.35;
        noiseLayerRef.current.style.opacity = noiseAlpha.toFixed(3);
        noiseLayerRef.current.style.transform = `scale(${noiseScale.toFixed(3)})`;
        noiseLayerRef.current.style.pointerEvents = noiseAlpha < 0.05 ? 'none' : 'auto';
      }

      // 2. Shield rises from below horizon (0.08 -> 0.7)
      if (shieldRef.current) {
        const shieldProg = norm(progress, 0.08, 0.7);
        const translateY = (1 - shieldProg) * 120; // 120px to 0
        const scale = 0.85 + shieldProg * 0.25; // 0.85 to 1.10
        const opacity = norm(progress, 0.05, 0.4);
        shieldRef.current.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        shieldRef.current.style.opacity = opacity.toFixed(3);
      }

      // 3. Title typography expands & tracks (0.15 -> 0.8)
      if (titleRef.current) {
        const titleProg = norm(progress, 0.15, 0.8);
        const titleY = (1 - titleProg) * 50;
        const titleOpacity = norm(progress, 0.12, 0.5);
        titleRef.current.style.transform = `translate3d(0, ${titleY.toFixed(1)}px, 0)`;
        titleRef.current.style.opacity = titleOpacity.toFixed(3);
      }

      // 4. Telemetry HUD fades in around 0.4
      if (hudRef.current) {
        const hudOpacity = norm(progress, 0.4, 0.85);
        hudRef.current.style.opacity = hudOpacity.toFixed(3);
      }

      // 5. Scroll prompt fades out immediately on scroll
      if (promptRef.current) {
        const promptOpacity = 1 - norm(progress, 0.0, 0.12);
        promptRef.current.style.opacity = promptOpacity.toFixed(3);
      }
    });

    return unsub;
  }, []);

  return (
    <section ref={containerRef} className="relative h-[260vh] bg-void">
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-6 md:p-14 select-none vault-grid">
        <div className="absolute inset-0 vault-radial pointer-events-none" />

        {/* LAYER 1: Cosmic Marketing Noise Cloud (Clears on scroll) */}
        <div
          ref={noiseLayerRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-void/90 backdrop-blur-md transition-all duration-75"
        >
          <div className="max-w-xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-alertAmber/10 border border-alertAmber/30 text-alertAmber text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UNGROUNDED MARKETING CLAIMS DETECTED</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-display text-white tracking-wide">
              "100% Guaranteed Returns!"
              <br />
              <span className="text-hazardRed text-xl md:text-3xl font-mono">
                "Instant Zero-Risk Wealth"
              </span>
            </h2>
            <p className="text-sm text-regolith/70 font-sans">
              Before BrandSure, unregulated statements leak into production ads, exposing fintechs to millions in SEBI & RBI statutory penalties.
            </p>
            <div className="pt-6 flex flex-col items-center gap-2 text-earth font-mono text-xs tracking-wider animate-pulse">
              <span>SCROLL TO DISSIPATE NOISE & ENGAGE TRUTH ENGINE</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* LAYER 2: Background Horizon & Grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[800px] h-[800px] rounded-full border border-indigoBrand/20 [mask-image:radial-gradient(circle,black_40%,transparent_70%)]" />
          <div className="w-[1200px] h-[1200px] rounded-full border border-earth/10 [mask-image:radial-gradient(circle,black_50%,transparent_80%)]" />
        </div>

        {/* LAYER 3: Centerpiece Brand Shield (PayNest Truth Core) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            ref={shieldRef}
            className="relative flex flex-col items-center justify-center will-change-transform opacity-0"
          >
            {/* Glowing Aura */}
            <div className="absolute -inset-16 bg-gradient-to-t from-indigoBrand/30 via-earth/20 to-transparent blur-3xl rounded-full" />
            <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-2xl bg-void/85 border border-earth/40 flex items-center justify-center shadow-[0_0_60px_rgba(111,182,255,0.25)] backdrop-blur-xl">
              <Shield className="w-20 h-20 md:w-28 md:h-28 text-earth drop-shadow-[0_0_20px_rgba(111,182,255,0.6)]" />
              <div className="absolute -bottom-3 px-3 py-1 bg-void border border-earth/60 rounded-full text-[10px] font-mono text-earth tracking-widest uppercase">
                Bounded Truth
              </div>
            </div>
          </div>
        </div>

        {/* LAYER 4: Title & Subtitle */}
        <div
          ref={titleRef}
          className="relative z-20 mt-16 md:mt-24 text-center max-w-4xl mx-auto space-y-4 opacity-0 will-change-transform"
        >
          <p className="text-[11px] md:text-xs font-mono uppercase tracking-[0.3em] text-earth">
            {SHOWCASE_CONTENT.hero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-7xl font-display font-black tracking-widestHero text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            {SHOWCASE_CONTENT.hero.title}
          </h1>
          <p className="text-sm md:text-base text-regolith/80 font-sans max-w-2xl mx-auto leading-relaxed">
            {SHOWCASE_CONTENT.hero.lead}
          </p>
        </div>

        {/* LAYER 5: Corner Telemetry Readouts (Fades in on scroll) */}
        <div
          ref={hudRef}
          className="relative z-20 grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 font-mono text-xs border-t border-borderMuted/60 bg-void/40 backdrop-blur-sm opacity-0 transition-opacity duration-300"
        >
          <div className="space-y-1">
            <span className="text-regolith/50 text-[10px] block">RULEBOOK REPOSITORY</span>
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-complianceGreen" />
              <span>48 Approved Guidelines</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-regolith/50 text-[10px] block">HYBRID RETRIEVAL</span>
            <div className="text-earth font-medium">
              pgvector + FTS Reciprocal Rank
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-regolith/50 text-[10px] block">BENCHMARK RECALL</span>
            <div className="text-white font-medium">
              100.0% (14 / 14 True Positives)
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-regolith/50 text-[10px] block">AGENT BOUNDARY</span>
            <div className="text-complianceGreen font-medium">
              Zero-Hallucination Guarded
            </div>
          </div>
        </div>

        {/* LAYER 6: Scroll Prompt */}
        <div
          ref={promptRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 font-mono text-[10px] text-regolith/60 tracking-widest uppercase transition-opacity"
        >
          <span>{SHOWCASE_CONTENT.hero.scrollPrompt}</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-earth" />
        </div>
      </div>
    </section>
  );
};
