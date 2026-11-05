'use client';

import React, { useEffect, useRef, useState } from 'react';
import { scrollManager } from './scroll';
import { clamp } from './math';
import { SHOWCASE_CONTENT, CampaignDraft } from './content';
import { AlertTriangle, CheckCircle, Eye, Sparkles } from 'lucide-react';

export const CampaignLog: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDraft, setActiveDraft] = useState<CampaignDraft>(SHOWCASE_CONTENT.campaignReel[0]);

  useEffect(() => {
    const unsub = scrollManager.subscribe(() => {
      if (!containerRef.current || !trackRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = containerRef.current.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, totalH));

      // Translate track horizontally: 0px -> -(totalWidth - windowWidth)
      const trackW = trackRef.current.scrollWidth;
      const maxScrollX = Math.max(0, trackW - window.innerWidth + 120);
      const currentX = progress * maxScrollX;

      trackRef.current.style.transform = `translate3d(${-currentX.toFixed(1)}px, 0, 0)`;

      // Active draft computation based on center frame
      const draftIdx = Math.min(
        SHOWCASE_CONTENT.campaignReel.length - 1,
        Math.floor(progress * SHOWCASE_CONTENT.campaignReel.length)
      );
      setActiveDraft((prev) => (prev.id !== SHOWCASE_CONTENT.campaignReel[draftIdx].id ? SHOWCASE_CONTENT.campaignReel[draftIdx] : prev));
    });

    return unsub;
  }, []);

  return (
    <section ref={containerRef} className="relative h-[320vh] bg-void">
      {/* Pinned Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-12 px-6 md:px-14 vault-grid">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-earth font-mono text-xs uppercase tracking-widest mb-1">
            <Eye className="w-3.5 h-3.5" />
            Inspection Reel & Ground-Truth Diffs
          </div>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-white tracking-wide">
            LIVE CAMPAIGN AUDIT LOG
          </h2>
          <p className="text-xs md:text-sm text-regolith/70 font-sans mt-1">
            Inspect real-world marketing drafts evaluated by the bounded review agent. The center card snaps into high focus with cited statutory rules and auto-suggested intent-preserving diffs.
          </p>
        </div>

        {/* Horizontal Filmstrip Reel */}
        <div className="relative z-10 w-full overflow-visible my-auto">
          <div
            ref={trackRef}
            className="flex items-center gap-8 pl-4 will-change-transform transition-transform duration-75"
          >
            {SHOWCASE_CONTENT.campaignReel.map((draft) => {
              const isSelected = activeDraft.id === draft.id;
              const hasViolations = draft.findings.length > 0;

              return (
                <div
                  key={draft.id}
                  className={`w-[360px] md:w-[480px] shrink-0 p-6 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? 'bg-void/95 border-earth shadow-[0_0_40px_rgba(111,182,255,0.2)] scale-100 opacity-100'
                      : 'bg-void/40 border-borderMuted scale-95 opacity-40 blur-[0.6px]'
                  }`}
                >
                  {/* Draft Header */}
                  <div className="flex items-center justify-between border-b border-borderMuted/60 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-earth uppercase tracking-wider block">
                        {draft.channel}
                      </span>
                      <h3 className="font-display font-semibold text-base text-white">
                        {draft.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium border ${
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
                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-3 rounded-lg bg-hazardRed/5 border border-hazardRed/20">
                      <div className="flex items-center justify-between text-[10px] font-mono text-hazardRed mb-1">
                        <span>ORIGINAL SUBMISSION (CREATOR DRAFT)</span>
                        <span>SCORE: {draft.score}/100</span>
                      </div>
                      <p className="text-regolith/90 line-through decoration-hazardRed/60">
                        {draft.originalText}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-complianceGreen/5 border border-complianceGreen/20">
                      <div className="flex items-center justify-between text-[10px] font-mono text-complianceGreen mb-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI-GENERATED SUGGESTION (PRESERVES INTENT)</span>
                        </span>
                        <span>100% CITED</span>
                      </div>
                      <p className="text-white font-medium">
                        {draft.reviewedText}
                      </p>
                    </div>
                  </div>

                  {/* Findings breakdown */}
                  {hasViolations && (
                    <div className="mt-4 pt-3 border-t border-borderMuted/40 space-y-2 font-mono text-[11px]">
                      <span className="text-regolith/50 text-[10px] block">
                        FLAGGED FINDINGS ({draft.findings.length})
                      </span>
                      {draft.findings.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2 rounded bg-void border border-borderMuted flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-alertAmber font-semibold">"{f.span}"</span>
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

        {/* Footer Guide */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-borderMuted/40 font-mono text-xs text-regolith/60">
          <div>SWIPE OR SCROLL TO NAVIGATE AUDIT CAROUSEL</div>
          <div className="text-earth">HUMANS DECIDE · AI ONLY FLAGS & SUGGESTS</div>
        </div>
      </div>
    </section>
  );
};
