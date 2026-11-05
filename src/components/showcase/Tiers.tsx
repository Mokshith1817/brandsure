'use client';

import React from 'react';
import { SHOWCASE_CONTENT } from './content';
import { Check, ShieldCheck, Zap } from 'lucide-react';

export const Tiers: React.FC = () => {
  return (
    <section className="relative py-28 px-6 md:px-14 bg-void vault-grid border-t border-borderMuted/60">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigoBrand/10 border border-indigoBrand/30 text-earth text-xs font-mono uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Statutory Architecture
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-wide">
            GOVERNANCE TIERS
          </h2>
          <p className="text-xs md:text-sm text-regolith/70 font-sans">
            Calibrated for compliance risk profiles across high-velocity social campaigns, SEBI-regulated wealth offerings, and sovereign enterprise deployments.
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {SHOWCASE_CONTENT.tiers.map((tier) => {
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between p-8 rounded-2xl border transition-all duration-300 ${
                  tier.recommended
                    ? 'bg-void/90 border-earth shadow-[0_0_40px_rgba(111,182,255,0.15)] ring-1 ring-earth/40'
                    : 'bg-void/40 border-borderMuted/80 hover:border-borderActive'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-earth text-void font-mono font-bold text-[10px] tracking-wider uppercase shadow-md">
                    Recommended For Fintechs
                  </div>
                )}

                {/* Concentric Rings Visualizer */}
                <div className="relative h-40 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 180 180" className="w-36 h-36">
                    {tier.ringRadii.map((radius, rIdx) => (
                      <circle
                        key={rIdx}
                        cx="90"
                        cy="90"
                        r={radius}
                        fill="none"
                        stroke={tier.recommended ? '#6fb6ff' : '#2b3648'}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="animate-[spin_40s_linear_infinite]"
                        style={{
                          animationDirection: rIdx % 2 === 0 ? 'normal' : 'reverse',
                        }}
                      />
                    ))}
                    <circle
                      cx="90"
                      cy="90"
                      r="12"
                      fill={tier.recommended ? '#4f46e5' : '#1b2230'}
                      stroke={tier.recommended ? '#6fb6ff' : '#4f46e5'}
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Tier Metadata */}
                <div className="space-y-4 mb-8">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-xl text-white">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-regolith/70 font-sans leading-relaxed">
                      {tier.headline}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-borderMuted/60 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-regolith/50 block">REVIEW SLA</span>
                      <span className="text-white font-medium">{tier.sla}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-regolith/50 block">BENCHMARK F1</span>
                      <span className="text-earth font-medium">{tier.accuracy}</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-4 border-t border-borderMuted/60 font-sans text-xs">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-complianceGreen shrink-0 mt-0.5" />
                      <span className="text-regolith/80">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <a
                    href="#sandbox"
                    className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      tier.recommended
                        ? 'bg-earth text-void hover:bg-earth/90 shadow-[0_0_20px_rgba(111,182,255,0.4)]'
                        : 'bg-void border border-borderActive text-white hover:bg-borderMuted'
                    }`}
                  >
                    <span>Deploy Workspace</span>
                    <Zap className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
