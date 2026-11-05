'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFindingDisposition, submitDraftForReview } from '@/app/actions/drafts';
import type { Draft, DraftVersion, Finding, FindingStatus, Severity } from '@/types/database';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { AIBadge } from '@/components/ui/AIBadge';
import { SourceCitation } from '@/components/ui/SourceCitation';
import { formatDate } from '@/lib/utils';
import {
  Check,
  Edit2,
  X,
  Send,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
  MessageSquare,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface DraftReviewClientProps {
  draft: Draft;
  version: DraftVersion;
  findings: Finding[];
  currentUserRole: string;
}

export function DraftReviewClient({
  draft,
  version,
  findings: initialFindings,
  currentUserRole,
}: DraftReviewClientProps) {
  const router = useRouter();
  const [currentText, setCurrentText] = useState(version.body);
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Edit modal / inline states
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [customFixText, setCustomFixText] = useState('');

  // Dismiss modal states
  const [dismissingFindingId, setDismissingFindingId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState('');

  const [submittingReview, setSubmittingReview] = useState(false);

  const openFindings = findings.filter((f) => f.status === 'open');
  const resolvedFindings = findings.filter((f) => f.status !== 'open');

  const counts = {
    high: openFindings.filter((f) => f.severity === 'high').length,
    medium: openFindings.filter((f) => f.severity === 'medium').length,
    low: openFindings.filter((f) => f.severity === 'low').length,
  };

  // Handle Accept Suggestion
  const handleAcceptFinding = async (finding: Finding) => {
    if (!finding.suggested_fix) return;

    try {
      const res = await updateFindingDisposition({
        draftId: draft.id,
        findingId: finding.id,
        status: 'accepted',
        currentBody: currentText,
        spanText: finding.span_text,
        replacementText: finding.suggested_fix,
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      // Update local state
      const updatedText = currentText.replace(finding.span_text, finding.suggested_fix);
      setCurrentText(updatedText);
      setFindings((prev) =>
        prev.map((f) =>
          f.id === finding.id
            ? { ...f, status: 'accepted', decision_reason: 'Accepted AI suggested fix' }
            : f
        )
      );

      toast.success('Applied suggested fix to draft text');
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept finding');
    }
  };

  // Handle Edit and Apply
  const handleSaveCustomEdit = async (finding: Finding) => {
    if (!customFixText.trim()) {
      toast.error('Replacement text cannot be empty');
      return;
    }

    try {
      const res = await updateFindingDisposition({
        draftId: draft.id,
        findingId: finding.id,
        status: 'edited',
        currentBody: currentText,
        spanText: finding.span_text,
        replacementText: customFixText.trim(),
        decisionReason: 'Customized replacement text applied by creator',
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      const updatedText = currentText.replace(finding.span_text, customFixText.trim());
      setCurrentText(updatedText);
      setFindings((prev) =>
        prev.map((f) =>
          f.id === finding.id
            ? {
                ...f,
                status: 'edited',
                decision_reason: `Applied customized fix: "${customFixText.trim()}"`,
              }
            : f
        )
      );

      setEditingFindingId(null);
      setCustomFixText('');
      toast.success('Applied custom edit to draft text');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save edit');
    }
  };

  // Handle Dismiss Finding with Mandatory Written Reason
  const handleConfirmDismiss = async (finding: Finding) => {
    if (!dismissReason.trim()) {
      toast.error('A written justification is mandatory when dismissing a compliance finding.');
      return;
    }

    try {
      const res = await updateFindingDisposition({
        draftId: draft.id,
        findingId: finding.id,
        status: 'dismissed',
        decisionReason: dismissReason.trim(),
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      setFindings((prev) =>
        prev.map((f) =>
          f.id === finding.id
            ? { ...f, status: 'dismissed', decision_reason: dismissReason.trim() }
            : f
        )
      );

      setDismissingFindingId(null);
      setDismissReason('');
      toast.info('Finding dismissed with recorded justification in audit log');
    } catch (err: any) {
      toast.error(err.message || 'Failed to dismiss finding');
    }
  };

  // Submit Draft for Review
  const handleSubmitForReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await submitDraftForReview(draft.id);
      if (res?.error) {
        toast.error(res.error);
        setSubmittingReview(false);
        return;
      }

      toast.success('Draft submitted to Reviewer Queue!');
      router.push('/drafts');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit draft for review');
      setSubmittingReview(false);
    }
  };

  // Render text with interactive span highlights
  const renderHighlightedContent = () => {
    if (!currentText) return null;

    // Find all active open findings that exist in currentText
    const activeSpans = openFindings
      .filter((f) => currentText.includes(f.span_text))
      .map((f) => ({
        id: f.id,
        span_text: f.span_text,
        severity: f.severity,
        index: currentText.indexOf(f.span_text),
      }))
      .filter((s) => s.index !== -1)
      .sort((a, b) => a.index - b.index);

    if (activeSpans.length === 0) {
      return <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{currentText}</p>;
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    activeSpans.forEach((span, i) => {
      // Text before the highlight
      if (span.index > lastIndex) {
        segments.push(
          <span key={`text-${i}`}>{currentText.slice(lastIndex, span.index)}</span>
        );
      }

      // Highlighted text span
      const isSelected = selectedFindingId === span.id;
      const severityStyles: Record<Severity, string> = {
        high: isSelected
          ? 'bg-red-200 text-red-950 border-b-2 border-red-700 font-semibold ring-2 ring-red-400'
          : 'bg-red-100 text-red-900 border-b-2 border-red-500 font-medium hover:bg-red-200',
        medium: isSelected
          ? 'bg-amber-200 text-amber-950 border-b-2 border-amber-700 font-semibold ring-2 ring-amber-400'
          : 'bg-amber-100 text-amber-900 border-b-2 border-amber-500 font-medium hover:bg-amber-200',
        low: isSelected
          ? 'bg-blue-200 text-blue-950 border-b-2 border-blue-700 font-semibold ring-2 ring-blue-400'
          : 'bg-blue-100 text-blue-900 border-b-2 border-blue-500 font-medium hover:bg-blue-200',
      };

      segments.push(
        <mark
          key={`span-${i}`}
          onClick={() => {
            setSelectedFindingId(span.id);
            const el = document.getElementById(`finding-card-${span.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }}
          className={`px-1 py-0.5 rounded transition-all cursor-pointer inline-block ${
            severityStyles[span.severity]
          }`}
          title={`Click to inspect finding: ${span.span_text}`}
        >
          {span.span_text}
        </mark>
      );

      lastIndex = span.index + span.span_text.length;
    });

    // Remainder of text
    if (lastIndex < currentText.length) {
      segments.push(<span key="text-end">{currentText.slice(lastIndex)}</span>);
    }

    return (
      <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
        {segments}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Draft Meta Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold uppercase text-xs">
            {draft.channel}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">Version {draft.current_version}</span>
              <StatusBadge status={draft.status} />
            </div>
            <span className="text-xs text-slate-400">Created {formatDate(draft.created_at)}</span>
          </div>
        </div>

        {/* Severity Metrics Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium mr-1">Compliance Flags:</span>
          <SeverityBadge severity="high" count={counts.high} />
          <SeverityBadge severity="medium" count={counts.medium} />
          <SeverityBadge severity="low" count={counts.low} />
          <span className="text-xs text-slate-400 ml-2">
            ({resolvedFindings.length} resolved)
          </span>
        </div>
      </div>

      {/* Main Two-Column Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): The Draft Content Display */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Draft Content</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentText.length} chars
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-200 min-h-[180px]">
            {renderHighlightedContent()}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Click any highlighted phrase to jump directly to its citation & suggested fix.</span>
          </div>

          {/* Action to submit draft */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={submittingReview || draft.status === 'in_review' || draft.status === 'approved'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submittingReview ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : draft.status === 'in_review' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Submitted for Review</span>
                </>
              ) : draft.status === 'approved' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Draft Approved</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Findings Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Review Agent Findings ({findings.length})</span>
            </h2>
            <span className="text-xs text-slate-500">
              {openFindings.length} open • {resolvedFindings.length} resolved
            </span>
          </div>

          {findings.length === 0 ? (
            <div className="bg-white border border-emerald-200 rounded-xl p-8 text-center shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Zero Compliance Violations Detected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                This copy fully aligns with PayNest approved guidelines, facts, and glossary terms. You can proceed with submission.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {findings.map((finding) => {
                const isSelected = selectedFindingId === finding.id;
                const isOpen = finding.status === 'open';

                return (
                  <div
                    key={finding.id}
                    id={`finding-card-${finding.id}`}
                    className={`bg-white rounded-xl border p-5 shadow-sm transition-all space-y-4 ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : isOpen
                        ? 'border-slate-200 hover:border-slate-300'
                        : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                    }`}
                  >
                    {/* Header: Category, Severity, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {finding.category}
                        </span>
                        <SeverityBadge severity={finding.severity} />
                        <AIBadge />
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border ${
                          finding.status === 'open'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : finding.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : finding.status === 'edited'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {finding.status}
                      </span>
                    </div>

                    {/* Flagged Text Span */}
                    <div className="text-xs">
                      <span className="text-slate-400 font-medium block mb-1">Flagged Content Span:</span>
                      <span className="inline-block px-2.5 py-1 bg-red-50 text-red-900 border border-red-200 rounded font-mono font-semibold">
                        "{finding.span_text}"
                      </span>
                    </div>

                    {/* Plain Language Reason */}
                    <div className="text-xs space-y-1">
                      <span className="text-slate-400 font-medium block">Compliance Reason:</span>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {finding.reason}
                      </p>
                    </div>

                    {/* Expandable Source Citation */}
                    <SourceCitation
                      sourceType={finding.source_type}
                      sourceId={finding.source_id}
                      excerpt={finding.source_excerpt}
                    />

                    {/* Suggested Fix (if present) */}
                    {finding.suggested_fix && (
                      <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            Suggested Intent-Preserving Fix:
                          </span>
                        </div>
                        <p className="text-indigo-900 font-medium bg-white p-2 rounded border border-indigo-200 font-mono">
                          {finding.suggested_fix}
                        </p>
                      </div>
                    )}

                    {/* Decision Actions for Creator */}
                    {isOpen ? (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {finding.suggested_fix && (
                            <button
                              type="button"
                              onClick={() => handleAcceptFinding(finding)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Fix</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditingFindingId(finding.id);
                              setCustomFixText(finding.suggested_fix || finding.span_text);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Custom Edit</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setDismissingFindingId(finding.id);
                            setDismissReason('');
                          }}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 p-1.5 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Dismiss with Reason</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 text-xs bg-slate-50 p-2.5 rounded text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resolved as {finding.status}</span>
                        </div>
                        {finding.decision_reason && (
                          <p className="text-[11px] text-slate-500 italic pl-5">
                            Justification: "{finding.decision_reason}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Inline Custom Edit Panel */}
                    {editingFindingId === finding.id && (
                      <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-2 mt-2">
                        <label className="text-xs font-bold text-indigo-950 block">
                          Custom Replacement for "{finding.span_text}":
                        </label>
                        <input
                          type="text"
                          value={customFixText}
                          onChange={(e) => setCustomFixText(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFindingId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveCustomEdit(finding)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded"
                          >
                            Apply Custom Fix
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Dismissal Justification Modal */}
                    {dismissingFindingId === finding.id && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Mandatory Dismissal Justification</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Regulatory governance requires every dismissal of a compliance finding to record an explicit written justification in the audit log.
                        </p>
                        <textarea
                          rows={2}
                          value={dismissReason}
                          onChange={(e) => setDismissReason(e.target.value)}
                          placeholder="State why this finding is being dismissed (e.g. Legal exception cleared, internal benchmark updated)..."
                          className="w-full text-xs p-2 bg-white border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDismissingFindingId(null)}
                            className="px-2.5 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmDismiss(finding)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded"
                          >
                            Confirm Dismissal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
