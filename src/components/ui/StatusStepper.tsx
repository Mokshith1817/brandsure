'use client';

import React from 'react';
import { Check, Clock, AlertTriangle, ShieldCheck, XCircle, FileEdit } from 'lucide-react';
import type { DraftStatus } from '@/types/database';

interface StatusStepperProps {
  status: DraftStatus;
}

export function StatusStepper({ status }: StatusStepperProps) {
  // Define standard linear progression
  const STEPS = [
    { id: 'draft', label: '1. Draft Created', desc: 'Initial submission' },
    { id: 'checked', label: '2. Checked', desc: 'AI checked against rules' },
    { id: 'in_review', label: '3. Waiting for Review', desc: 'Submitted to team' },
    { id: 'approved', label: '4. Approved', desc: 'Signed off for publishing' },
  ];

  const getStepIndex = (st: DraftStatus): number => {
    switch (st) {
      case 'draft':
        return 0;
      case 'checked':
        return 1;
      case 'in_review':
        return 2;
      case 'approved':
        return 3;
      case 'changes_requested':
        return 2; // in review phase
      case 'rejected':
        return 2;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  // Percentage for animated progress bar
  const progressPercent = Math.min(100, Math.round((currentIndex / (STEPS.length - 1)) * 100));

  return (
    <div
      className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
      role="region"
      aria-label="Draft review progress stepper"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 tracking-tight">Review Workflow Progress</span>
        <span className="text-[11px] text-slate-500 font-medium">
          Step {currentIndex + 1} of {STEPS.length}
        </span>
      </div>

      <div className="relative pt-2 pb-1">
        {/* Track Line Background */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-slate-100 rounded-full" aria-hidden="true" />

        {/* Animated Active Progress Line */}
        <div
          className="absolute top-6 left-6 h-1 bg-indigo-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `calc(${progressPercent}% * (100% - 3rem) / 100)` }}
          aria-hidden="true"
        />

        {/* Step Nodes */}
        <div className="relative flex justify-between items-start">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isFuture = idx > currentIndex;

            let iconNode = <span className="text-xs font-semibold">{idx + 1}</span>;
            let nodeBg = 'bg-slate-100 text-slate-400 border-slate-200';

            if (isCompleted) {
              nodeBg = 'bg-indigo-600 text-white border-indigo-600';
              iconNode = <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
            } else if (isCurrent) {
              if (status === 'approved') {
                nodeBg = 'bg-emerald-600 text-white border-emerald-600';
                iconNode = <ShieldCheck className="w-4 h-4 text-white" aria-hidden="true" />;
              } else if (status === 'changes_requested') {
                nodeBg = 'bg-amber-600 text-white border-amber-600';
                iconNode = <AlertTriangle className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
              } else if (status === 'rejected') {
                nodeBg = 'bg-red-600 text-white border-red-600';
                iconNode = <XCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
              } else {
                nodeBg = 'bg-white text-indigo-700 border-2 border-indigo-600 ring-4 ring-indigo-50';
                iconNode = <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" aria-hidden="true" />;
              }
            }

            return (
              <div key={step.id} className="flex flex-col items-center text-center max-w-[80px] sm:max-w-[120px]">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 z-10 ${nodeBg}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {iconNode}
                </div>

                <div className="mt-2 space-y-0.5">
                  <div
                    className={`text-[11px] sm:text-xs font-bold leading-tight ${
                      isCurrent
                        ? status === 'approved'
                          ? 'text-emerald-700'
                          : status === 'changes_requested'
                          ? 'text-amber-800'
                          : status === 'rejected'
                          ? 'text-red-700'
                          : 'text-indigo-700'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {isCurrent && status === 'changes_requested'
                      ? 'Changes Requested'
                      : isCurrent && status === 'rejected'
                      ? 'Rejected'
                      : step.label.replace(/^\d+\.\s*/, '')}
                  </div>
                  <p className="text-[10px] text-slate-400 hidden sm:block leading-tight">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
