'use client';

import React from 'react';
import { SHOWCASE_CONTENT } from './content';
import { Check, ShieldCheck, Sparkles, Clock, ArrowRight } from 'lucide-react';

export const Tiers: React.FC = () => {
  return (
    <section className="relative py-24 px-6 md:px-14 bg-void vault-grid border-t border-borderMuted/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigoBrand/10 border border-indigoBrand/30 text-earth text-xs font-mono uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Product Architecture
          </div>
          <h2 className="text-2xl md:text-4xl font-display text-white tracking-wide font-normal">
            ROADMAP (CONCEPT)
          </h2>
          <p className="text-xs md:text-sm text-regolith/75 font-sans leading-relaxed">
            What is built and working in Round 2, followed by planned architectural extensions for multi-modal marketing assets and compliance analytics.
          </p>
        </div>

        {/* Roadmap Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {SHOWCASE_CONTENT.roadmap.map((item) => {
            const isCurrent = item.stage === 'Active in Round 2';

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-void/90 border-earth shadow-sm ring-1 ring-earth/30'
                    : 'bg-void/40 border-borderMuted/80'
                }`}
              >
                {/* Stage Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-wider ${
                      isCurrent
                        ? 'bg-complianceGreen/15 text-complianceGreen border border-complianceGreen/30'
                        : 'bg-borderMuted text-regolith/70 border border-borderActive'
                    }`}
                  >
                    {isCurrent ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3 text-earth" />
                    )}
                    <span>{item.stage}</span>
                  </span>
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-6">
                  <h3 className="font-display font-normal text-lg text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-regolith/70 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Capabilities */}
                <div className="space-y-2.5 pt-4 border-t border-borderMuted/60 font-sans text-xs flex-1">
                  {item.capabilities.map((cap, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-earth shrink-0 mt-1.5" />
                      <span className="text-regolith/85 leading-normal">{cap}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Link */}
                <div className="pt-6 mt-4 border-t border-borderMuted/40">
                  {isCurrent ? (
                    <a
                      href="#sandbox"
                      className="w-full py-2 px-3 rounded-lg font-mono text-xs font-semibold bg-earth text-void flex items-center justify-center gap-1.5 hover:bg-earth/90 transition-colors"
                    >
                      <span>Test Working Engine</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] font-mono text-regolith/50 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-earth" />
                      <span>Planned architecture</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
