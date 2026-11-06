'use client';

import React, { useState } from 'react';
import { ShieldCheck, Send, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface SimulatedEvaluation {
  status: 'passed' | 'flagged';
  findings: Array<{ span: string; issue: string; rule: string; fix: string }>;
  suggestedText: string;
}

export const Manifest: React.FC = () => {
  const [draftInput, setDraftInput] = useState(
    'Get guaranteed 15% annual returns with PayNest Gold! Open an account with zero balance in under 30 seconds.'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<SimulatedEvaluation | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);

    setTimeout(() => {
      setIsEvaluating(false);
      const textLower = draftInput.toLowerCase();
      const findings: SimulatedEvaluation['findings'] = [];
      let rewritten = draftInput;

      // Dynamic rule evaluation based on actual PayNest rulebook
      if (textLower.includes('guaranteed') || textLower.includes('risk-free') || textLower.includes('zero risk')) {
        findings.push({
          span: textLower.includes('guaranteed') ? 'guaranteed' : 'zero risk',
          issue: 'Prohibited superlative on market-linked securities (PayNest Rule GL-INV-04).',
          rule: 'GL-INV-04 (SEBI Mutual Fund & Securities Promotion Code)',
          fix: 'Target market-linked returns (subject to market risks)',
        });
        rewritten = rewritten.replace(/guaranteed\s+\d+%?\s+(annual\s+)?returns?/gi, 'market-linked returns');
        rewritten = rewritten.replace(/zero\s+risk/gi, 'market risks apply');
      }

      if (textLower.includes('30 seconds') || textLower.includes('instant approval')) {
        findings.push({
          span: textLower.includes('30 seconds') ? 'in under 30 seconds' : 'instant approval',
          issue: 'Fact mismatch with verified PayNest KYC SLA (minimum 2 minutes).',
          rule: 'Fact: KYC-SLA-2026',
          fix: 'in 2 minutes',
        });
        rewritten = rewritten.replace(/in\s+under\s+30\s+seconds/gi, 'in 2 minutes');
      }

      if (textLower.includes('crush') || textLower.includes('beat all')) {
        findings.push({
          span: 'crush',
          issue: 'Disparaging competitor comparison prohibited under brand voice guidelines.',
          rule: 'PayNest Brand Voice Standard §3.2',
          fix: 'outperform traditional alternatives',
        });
      }

      if (findings.length > 0) {
        setResult({
          status: 'flagged',
          findings,
          suggestedText: `${rewritten} Investments are subject to market risks. Read all scheme documents carefully.`,
        });
      } else {
        setResult({
          status: 'passed',
          findings: [],
          suggestedText: draftInput,
        });
      }
    }, 350);
  };

  return (
    <section id="sandbox" className="relative py-24 px-6 md:px-14 bg-void vault-grid border-t border-borderMuted/60">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header & Disclaimer */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-earth/10 border border-earth/30 text-earth text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INTERACTIVE EVALUATOR SANDBOX</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display text-white tracking-wide font-normal">
            Test Marketing Copy Against PayNest Rules
          </h2>
          <div className="p-3 rounded-lg bg-indigoBrand/10 border border-indigoBrand/30 font-mono text-xs text-regolith/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              ℹ️ <strong>Simulated demonstration:</strong> Evaluates inputs dynamically against approved PayNest rulebook rules and fact keys.
            </span>
            <span className="text-earth shrink-0">Fictional Demo Brand</span>
          </div>
        </div>

        {/* Form and Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs text-regolith/75 font-sans leading-relaxed">
              Type or paste marketing copy. The bounded engine evaluates text against approved glossary terms, numeric tariff fact sheets, and guidelines without overwriting creator text.
            </p>
            <div className="p-4 rounded-xl bg-void border border-borderMuted font-mono text-xs text-regolith/70 space-y-2">
              <div className="text-white font-medium">Sample Test Triggers:</div>
              <div>• "guaranteed returns" (Triggers GL-INV-04)</div>
              <div>• "in under 30 seconds" (Triggers Fact: KYC-SLA-2026)</div>
              <div>• "zero balance" (Matches Fact: Tariff-2026)</div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-void/90 border border-borderMuted shadow-sm space-y-4">
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
                  Target: PayNest Promotional Standards
                </span>
                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="px-4 py-2 rounded-lg bg-indigoBrand hover:bg-indigoBrand/80 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <span>Evaluating Against Rules...</span>
                  ) : (
                    <>
                      <span>Run Bounded Inspection</span>
                      <Send className="w-3 h-3 text-earth" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Results Display */}
            {result && (
              <div className="mt-4 pt-4 border-t border-borderMuted/60 space-y-3 font-sans text-xs">
                {result.status === 'flagged' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-hazardRed flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>{result.findings.length} Finding(s) Flagged</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-hazardRed/10 text-hazardRed font-mono text-[10px] border border-hazardRed/20">
                        Review Required
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      {result.findings.map((f, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-void border border-borderMuted text-regolith/85 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-alertAmber font-medium">"{f.span}"</span>
                            <span className="text-earth text-[10px]">{f.rule}</span>
                          </div>
                          <p className="text-regolith/60 text-[10px]">{f.issue}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-complianceGreen/5 border border-complianceGreen/20">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-complianceGreen mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI-GENERATED SUGGESTION (PRESERVES INTENT):</span>
                      </div>
                      <p className="text-white font-medium">
                        {result.suggestedText}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-lg bg-complianceGreen/10 border border-complianceGreen/30 text-complianceGreen font-mono text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No rule violations found against current PayNest sample rules.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
