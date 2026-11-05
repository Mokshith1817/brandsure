'use client';

import React, { useEffect, useState } from 'react';
import { Type } from 'lucide-react';

export type TextSize = 'normal' | 'large' | 'xl';

export function TextSizeControl() {
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('brandsure_text_size') as TextSize) || 'normal';
    setTextSize(saved);
    applyTextSize(saved);
  }, []);

  const applyTextSize = (size: TextSize) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-xl');
    root.classList.add(`text-size-${size}`);
    localStorage.setItem('brandsure_text_size', size);
  };

  const handleChange = (size: TextSize) => {
    setTextSize(size);
    applyTextSize(size);
  };

  if (!mounted) return null;

  return (
    <div
      className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200"
      role="group"
      aria-label="Text size control"
    >
      <Type className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" aria-hidden="true" />
      <button
        type="button"
        onClick={() => handleChange('normal')}
        className={`px-2 py-1 text-xs font-medium rounded transition-all min-h-[32px] sm:min-h-[28px] ${
          textSize === 'normal'
            ? 'bg-white text-indigo-700 shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Normal text size (16px)"
        aria-pressed={textSize === 'normal'}
      >
        A
      </button>
      <button
        type="button"
        onClick={() => handleChange('large')}
        className={`px-2 py-1 text-xs font-medium rounded transition-all min-h-[32px] sm:min-h-[28px] ${
          textSize === 'large'
            ? 'bg-white text-indigo-700 shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Large text size (18px)"
        aria-pressed={textSize === 'large'}
      >
        A+
      </button>
      <button
        type="button"
        onClick={() => handleChange('xl')}
        className={`px-2 py-1 text-xs font-medium rounded transition-all min-h-[32px] sm:min-h-[28px] ${
          textSize === 'xl'
            ? 'bg-white text-indigo-700 shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Extra large text size (20px)"
        aria-pressed={textSize === 'xl'}
      >
        A++
      </button>
    </div>
  );
}
