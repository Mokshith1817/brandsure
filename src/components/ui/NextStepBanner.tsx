'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface NextStepBannerProps {
  statusTitle: string;
  explanation: string;
  actionText: string;
  actionHref?: string;
  onActionClick?: () => void;
  variant?: 'info' | 'success' | 'warning';
}

export function NextStepBanner({
  statusTitle,
  explanation,
  actionText,
  actionHref,
  onActionClick,
  variant = 'info',
}: NextStepBannerProps) {
  const variantStyles = {
    info: {
      bg: 'bg-indigo-50/80 border-indigo-200',
      icon: <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" aria-hidden="true" />,
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />,
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />,
      btn: 'bg-amber-700 hover:bg-amber-800 text-white',
    },
  }[variant];

  return (
    <div
      className={`p-4 rounded-xl border ${variantStyles.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-fade-in-up`}
      role="region"
      aria-label="Recommended next step"
    >
      <div className="flex items-start gap-3">
        {variantStyles.icon}
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Next Step: {statusTitle}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{explanation}</p>
        </div>
      </div>

      <div className="shrink-0">
        {actionHref ? (
          <Link
            href={actionHref}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all tap-target-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${variantStyles.btn}`}
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onActionClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all tap-target-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${variantStyles.btn}`}
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
