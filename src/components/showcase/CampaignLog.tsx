'use client';

import React, { useEffect, useRef } from 'react';
import { onFrame } from './scroll';
import { pinProgress } from './math';
import { SHOWCASE_CONTENT } from './content';
import { AlertTriangle, CheckCircle, Eye, Sparkles } from 'lucide-react';

export const CampaignLog: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let last = -1;
    let currentIdx = -1;

    return onFrame(() => {
      const root = containerRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const { p, rect, vh } = pinProgress(root);

      // Off-screen & unchanged guards (R6)
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - last) < 0.0005) return;
      last = p;

      // Translate track horizontally (R3: transition none, transform only - R4)
      const trackW = track.scrollWidth;
      const maxScrollX = Math.max(0, trackW - window.innerWidth + 80);
      const currentX = p * maxScrollX;
      track.style.transform = `translate3d(${-currentX.toFixed(1)}px, 0, 0)`;

      // Center card computation and transform/opacity writes (R5: no blur filters)
      const totalCards = SHOWCASE_CONTENT.campaignReel.length;
      const activeIdx = Math.min(totalCards - 1, Math.floor(p * totalCards));

      if (activeIdx !== currentIdx) {
        currentIdx = activeIdx;
        cardsRef.current.forEach((card, idx) => {
          if (!card) return;
          const isCentered = idx === activeIdx;
          card.style.transform = isCentered ? 'scale(1)' : 'scale(0.94)';
          card.style.opacity = isCentered ? '1' : '0.55';
          card.dataset.active = String(isCentered);
        });
      }
    });
  }, []);

  return (
    <section ref={containerRef} className="relative h-[280svh] bg-void">
      {/* Pinned Stage Container (100svh - R8) */}
      <div className="sticky top-0 h-screen-s w-full overflow-hidden flex flex-col justify-between py-10 px-6 md:px-12 vault-grid">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-earth font-mono text-xs uppercase tracking-widest mb-1">
            <Eye className="w-3.5 h-3.5" />
            Inspection Reel & Ground-Truth Diffs
          </div>
          <h2 className="text-xl md:text-3xl font-display text-white tracking-wide font-normal">
            ILLUSTRATIVE CAMPAIGN AUDIT REEL
          </h2>
          <p className="text-xs md:text-sm text-regolith/70 font-sans mt-1">
            Sample PayNest marketing drafts evaluated by the bounded review agent. The card nearest the focus line is sharp and full-scale with cited rules.
          </p>
        </div>

        {/* Horizontal Filmstrip Reel */}
        <div className="relative z-10 w-full overflow-visible my-auto">
          <div
            ref={trackRef}
            data-scroll-driven
            className="flex items-center gap-6 pl-4"
          >
            {SHOWCASE_CONTENT.campaignReel.map((draft, idx) => {
              const hasViolations = draft.findings.length > 0;

              return (
                <div
                  key={draft.id}
                  ref={(el) => {
                    if (el) cardsRef.current[idx] = el;
                  }}
                  data-active={idx === 0 ? 'true' : 'false'}
                  data-scroll-driven
                  style={{
                    transform: idx === 0 ? 'scale(1)' : 'scale(0.94)',
                    opacity: idx === 0 ? 1 : 0.55,
                  }}
                  className="w-[78vw] max-w-[480px] shrink-0 p-5 md:p-6 rounded-2xl border border-borderMuted bg-void/90 shadow-md transition-none"
                >
                  {/* Draft Header */}
                  <div className="flex items-center justify-between border-b border-borderMuted/60 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-earth uppercase tracking-wider block">
                        {draft.channel}
                      </span>
                      <h3 className="font-display text-sm md:text-base text-white font-normal">
                        {draft.title}
                      </h3>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium border ${
                          draft.status === 'Approved'
                            ? 'bg-complianceGreen/10 border-complianceGreen/30 text-complianceGreen'
                            : 'bg-alertAmber/10 border-alertAmber/30 text-alertAmber'
                        }`}
                      >
                        {draft.status === 'Approved' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{draft.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Original vs Reviewed Diff Box */}
                  <div className="space-y-2.5 font-sans text-xs">
                    <div className="p-2.5 rounded-lg bg-hazardRed/5 border border-hazardRed/20">
                      <div className="flex items-center justify-between text-[10px] font-mono text-hazardRed mb-1">
                        <span>ORIGINAL SUBMISSION (CREATOR DRAFT)</span>
                        <span>SCORE: {draft.score}/100</span>
                      </div>
                      <p className="text-regolith/90 line-through decoration-hazardRed/60">
                        {draft.originalText}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-complianceGreen/5 border border-complianceGreen/20">
                      <div className="flex items-center justify-between text-[10px] font-mono text-complianceGreen mb-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI-GENERATED SUGGESTION (PRESERVES INTENT)</span>
                        </span>
                        <span>CITED FIX</span>
                      </div>
                      <p className="text-white font-medium">
                        {draft.reviewedText}
                      </p>
                    </div>
                  </div>

                  {/* Findings Breakdown */}
                  {hasViolations && (
                    <div className="mt-3 pt-2.5 border-t border-borderMuted/40 space-y-1.5 font-mono text-[11px]">
                      <span className="text-regolith/50 text-[10px] block uppercase">
                        Findings ({draft.findings.length})
                      </span>
                      {draft.findings.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2 rounded bg-void border border-borderMuted flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-alertAmber font-medium">"{f.span}"</span>
                            <span className="px-1.5 py-0.2 rounded bg-hazardRed/10 text-hazardRed text-[9px] uppercase border border-hazardRed/20">
                              {f.severity}
                            </span>
                          </div>
                          <span className="text-regolith/60 text-[10px]">{f.issue}</span>
                          <span className="text-earth text-[10px]">Cites: {f.ruleRef}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-borderMuted/40 font-mono text-[11px] text-regolith/60">
          <div>SWIPE OR SCROLL TO ADVANCE INSPECTION STRIP</div>
          <div className="text-earth">HUMANS DECIDE · AI ONLY FLAGS & SUGGESTS</div>
        </div>
      </div>
    </section>
  );
};
