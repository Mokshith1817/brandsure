'use client';

import React, { useEffect, useState } from 'react';
import { Check, Loader2, Sparkles, Database, BookOpen, ShieldCheck, FileCheck } from 'lucide-react';

interface AgentStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const REVIEW_STEPS: AgentStep[] = [
  {
    id: 'terminology',
    label: 'Checking Names & Terms',
    description: 'Scanning against approved brand terminology & banned glossary words',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: 'facts',
    label: 'Verifying Claims Against Facts',
    description: 'Validating metrics, pricing, fee promises, and benchmark figures',
    icon: <Database className="w-4 h-4" />,
  },
  {
    id: 'guidelines',
    label: 'Retrieving Approved Guidelines',
    description: 'Hybrid vector search (pgvector) and keyword retrieval via RRF',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    id: 'fixes',
    label: 'Writing Safer Rewrites',
    description: 'Generating intent-preserving suggestions without invented facts',
    icon: <Sparkles className="w-4 h-4" />,
  },
];

interface AgentProgressTimelineProps {
  onComplete?: () => void;
  isSimulated?: boolean;
}

export function AgentProgressTimeline({ onComplete, isSimulated = false }: AgentProgressTimelineProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isSimulated) {
      setCompletedSteps([0, 1, 2, 3]);
      return;
    }

    const t1 = setTimeout(() => setCompletedSteps((prev) => [...prev, 0]), 250);
    const t2 = setTimeout(() => setCompletedSteps((prev) => [...prev, 1]), 600);
    const t3 = setTimeout(() => setCompletedSteps((prev) => [...prev, 2]), 1000);
    const t4 = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, 3]);
      if (onComplete) onComplete();
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isSimulated, onComplete]);

  return (
    <div
      className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
      role="region"
      aria-label="Agent check timeline"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          <span className="text-xs font-bold text-slate-900 tracking-tight">Bounded Compliance Verification</span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <FileCheck className="w-3 h-3" />
          <span>Strictly Grounded</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {REVIEW_STEPS.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const isCurrent = !isDone && (idx === 0 || completedSteps.includes(idx - 1));

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                isDone
                  ? 'bg-white border-emerald-200 shadow-xs'
                  : isCurrent
                  ? 'bg-white border-indigo-300 ring-2 ring-indigo-50 shadow-xs'
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-700'
                      : isCurrent
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step.icon}
                </div>
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <Check className="w-3 h-3" aria-hidden="true" />
                  </div>
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" aria-hidden="true" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">0{idx + 1}</span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-900 leading-tight">{step.label}</div>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
