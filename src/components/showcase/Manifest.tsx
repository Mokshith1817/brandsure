'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Send, Clock, AlertCircle, Sparkles } from 'lucide-react';

export const Manifest: React.FC = () => {
  // Countdown to next regulatory update window (SEBI circular review)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 48 });
  const [draftInput, setDraftInput] = useState(
    'Get guaranteed 15% annual profit with PayNest Gold Wallet! Zero account opening fee.'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<{
    flagged: boolean;
    findings: string[];
    suggested: string;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        return { hours: Math.max(0, prev.hours - 1), minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setResult({
        flagged: true,
        findings: [
          'Prohibited claim: "guaranteed 15% annual profit" violates SEBI Advertising Code (GL-INV-04).',
          'Fact substantiated: "Zero account opening fee" matches Tariff-2026 Fact Base.'
        ],
        suggested:
          'Target market-linked returns with PayNest Gold Wallet. Zero account opening fee. Investments are subject to market risks.'
      });
    }, 450);
  };

  return (
    <section id="sandbox" className="relative py-28 px-6 md:px-14 bg-void vault-grid border-t border-borderMuted/60">
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Ticking Countdown HUD */}
        <div className="p-6 rounded-2xl bg-void/80 border border-borderMuted flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigoBrand/10 border border-indigoBrand/30 text-earth">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-earth uppercase tracking-widest block">
                REGULATORY SYNC WINDOW
              </span>
              <h3 className="font-display font-semibold text-lg text-white">
                Next SEBI/RBI Rulebook Refresh
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-center">
            {[
              { val: timeLeft.hours, label: 'HOURS' },
              { val: timeLeft.minutes, label: 'MINS' },
              { val: timeLeft.seconds, label: 'SECS' }
            ].map((unit, uIdx) => (
              <div key={uIdx} className="px-4 py-2 rounded-lg bg-void border border-borderActive">
                <span className="text-xl md:text-2xl font-bold text-white block">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-regolith/50 tracking-wider">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Draft Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-earth/10 border border-earth/30 text-earth text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>INTERACTIVE EVALUATOR SANDBOX</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-white tracking-wide">
              Test Copy Against Bounded Engine
            </h2>
            <p className="text-xs text-regolith/70 font-sans leading-relaxed">
              Paste fintech marketing copy or test a promotional offer. The engine performs exact fact lookups and applies zero-hallucination guardrails without altering human editorial control.
            </p>
            <div className="p-4 rounded-xl bg-void border border-borderMuted font-mono text-xs text-regolith/60 space-y-2">
              <div className="text-white font-medium">Demo Pre-loaded Rules:</div>
              <div>• Banned: "guaranteed returns", "risk-free"</div>
              <div>• Fact Key: Tariff-2026 (Zero account opening fee verified)</div>
              <div>• Mandatory: SEBI risk disclosure injection</div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-void/90 border border-earth/40 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-regolith/80 mb-2">
                  MARKETING COPY DRAFT:
                </label>
                <textarea
                  rows={4}
                  value={draftInput}
                  onChange={(e) => setDraftInput(e.target.value)}
                  className="w-full p-3 rounded-lg bg-void border border-borderActive text-white font-sans text-xs focus:outline-none focus:border-earth transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-regolith/50">
                  Target: PayNest UPI & Gold Savings
                </span>
                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="px-5 py-2 rounded-lg bg-indigoBrand hover:bg-indigoBrand/80 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <span>Evaluating Against Facts...</span>
                  ) : (
                    <>
                      <span>Run Bounded Inspection</span>
                      <Send className="w-3 h-3 text-earth" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Simulated Result Box */}
            {result && (
              <div className="mt-6 pt-6 border-t border-borderMuted/60 space-y-4 font-sans text-xs animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-hazardRed flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>2 Findings Flagged by Engine</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-hazardRed/10 text-hazardRed font-mono text-[10px] border border-hazardRed/20">
                    High Severity
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  {result.findings.map((finding, idx) => (
                    <div key={idx} className="p-2 rounded bg-void border border-borderMuted text-regolith/80">
                      {finding}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-complianceGreen/5 border border-complianceGreen/20">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-complianceGreen mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SUGGESTED REWRITE (PRESERVES MARKETING CONVERSION):</span>
                  </div>
                  <p className="text-white font-medium">
                    {result.suggested}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
