import React from 'react';
import type { Severity } from '@/types/database';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  switch (severity) {
    case 'high':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          <span>High Risk</span>
        </span>
      );
    case 'medium':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>Medium Risk</span>
        </span>
      );
    case 'low':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 ${className}`}>
          <Info className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          <span>Low Risk</span>
        </span>
      );
    default:
      return null;
  }
}
