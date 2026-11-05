'use client';

import React, { useState } from 'react';
import type { SourceType } from '@/types/database';
import { ChevronDown, ChevronRight, BookOpen, Database, BookmarkX } from 'lucide-react';

interface SourceCitationProps {
  sourceType: SourceType;
  sourceId?: string | null;
  sourceExcerpt?: string | null;
  className?: string;
}

export function SourceCitation({
  sourceType,
  sourceId,
  sourceExcerpt,
  className = '',
}: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false);

  if (sourceType === 'none' || !sourceExcerpt) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 ${className}`}>
        <BookmarkX className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-600">No approved source found</span>
        <span className="text-slate-400">— ungrounded claim</span>
      </div>
    );
  }

  const icon =
    sourceType === 'fact' ? (
      <Database className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
    ) : (
      <BookOpen className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
    );

  const label =
    sourceType === 'fact'
      ? 'Approved Fact'
      : sourceType === 'glossary'
      ? 'Brand Glossary'
      : 'Brand Guideline';

  return (
    <div className={`text-xs border rounded bg-slate-50 border-slate-200 overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon}
          <span className="font-semibold text-slate-700">{label}:</span>
          <span className="text-slate-600 truncate">{sourceId || 'Rule Reference'}</span>
        </div>
        <span className="text-slate-400 flex items-center gap-0.5 text-[11px]">
          {expanded ? 'Hide rule' : 'View rule'}
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
      </button>

      {expanded && (
        <div className="px-3 py-2 border-t border-slate-200 bg-white text-slate-700">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Approved Source Excerpt:
          </p>
          <blockquote className="border-l-2 border-indigo-500 pl-2 text-xs italic text-slate-800 bg-indigo-50/30 py-1 pr-1 rounded-r">
            &ldquo;{sourceExcerpt}&rdquo;
          </blockquote>
        </div>
      )}
    </div>
  );
}
