'use client';

import React from 'react';
import * as diff from 'diff';

interface DiffViewProps {
  original: string;
  modified: string;
  className?: string;
}

export function DiffView({ original, modified, className = '' }: DiffViewProps) {
  const changes = diff.diffWordsWithSpace(original, modified);

  return (
    <div className={`p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs leading-relaxed ${className}`}>
      <div className="flex items-center gap-3 mb-2 pb-1.5 border-b border-slate-200 text-[11px] font-sans text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-200 border border-red-400 inline-block" />
          <span>Removed (Original)</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 border border-emerald-400 inline-block" />
          <span>Added (Fix)</span>
        </span>
      </div>
      <div className="whitespace-pre-wrap break-words">
        {changes.map((part, index) => {
          if (part.added) {
            return (
              <ins
                key={index}
                className="bg-emerald-100 text-emerald-800 no-underline px-0.5 rounded font-semibold border-b border-emerald-400"
                title="Added in suggested fix"
              >
                {part.value}
              </ins>
            );
          }
          if (part.removed) {
            return (
              <del
                key={index}
                className="bg-red-100 text-red-800 line-through px-0.5 rounded opacity-80"
                title="Removed from original"
              >
                {part.value}
              </del>
            );
          }
          return <span key={index} className="text-slate-800">{part.value}</span>;
        })}
      </div>
    </div>
  );
}
