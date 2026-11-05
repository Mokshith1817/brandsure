import React from 'react';
import type { DraftStatus } from '@/types/database';
import { 
  FileEdit, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  XCircle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: DraftStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  switch (status) {
    case 'draft':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          <FileEdit className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>Draft</span>
        </span>
      );
    case 'checked':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
          <span>Checked</span>
        </span>
      );
    case 'in_review':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
          <span>In Review</span>
        </span>
      );
    case 'changes_requested':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
          <span>Changes Requested</span>
        </span>
      );
    case 'approved':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>Approved</span>
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          <span>Rejected</span>
        </span>
      );
    default:
      return null;
  }
}
