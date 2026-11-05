'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFindingDisposition, submitDraftForReview } from '@/app/actions/drafts';
import { addComment, recordDecision, createNewVersion } from '@/app/actions/collaboration';
import type { Draft, DraftVersion, Finding, FindingStatus, Severity, Role } from '@/types/database';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { AIBadge } from '@/components/ui/AIBadge';
import { SourceCitation } from '@/components/ui/SourceCitation';
import { DiffView } from '@/components/ui/DiffView';
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
  ShieldAlert,
  RotateCcw,
  Ban,
  GitBranch,
  Layers,
  History,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DraftReviewClientProps {
  draft: Draft;
  version: DraftVersion;
  findings: Finding[];
  currentUserRole: string;
  initialComments?: any[];
  initialDecisions?: any[];
  allVersions?: DraftVersion[];
}

export function DraftReviewClient({
  draft,
  version,
  findings: initialFindings,
  currentUserRole,
  initialComments = [],
  initialDecisions = [],
  allVersions = [],
}: DraftReviewClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'findings' | 'comments' | 'history'>('findings');
  const [currentText, setCurrentText] = useState(version.body);
  const [draftStatus, setDraftStatus] = useState(draft.status);
  const [findings, setFindings] = useState<Finding[]>(initialFindings);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Edit finding states
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [customFixText, setCustomFixText] = useState('');

  // Dismiss finding states
  const [dismissingFindingId, setDismissingFindingId] = useState<string | null>(null);
  const [dismissReason, setDismissReason] = useState('');

  // Manager decision states
  const [decisionModal, setDecisionModal] = useState<{
    open: boolean;
    type: 'approved' | 'rejected' | 'changes_requested';
  } | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Comments state
  const [comments, setComments] = useState<any[]>(initialComments);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // New Version state
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [newVersionBody, setNewVersionBody] = useState(currentText);
  const [submittingVersion, setSubmittingVersion] = useState(false);

  const [submittingReview, setSubmittingReview] = useState(false);

  const openFindings = findings.filter((f) => f.status === 'open');
  const resolvedFindings = findings.filter((f) => f.status !== 'open');

  const counts = {
    high: openFindings.filter((f) => f.severity === 'high').length,
    medium: openFindings.filter((f) => f.severity === 'medium').length,
    low: openFindings.filter((f) => f.severity === 'low').length,
  };

  const isManagerOrAdmin = currentUserRole === 'manager' || currentUserRole === 'admin';

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

  // Handle Custom Edit
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

  // Handle Dismiss Finding with Mandatory Reason
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

      setDraftStatus('in_review');
      toast.success('Draft submitted to Reviewer Queue!');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit draft for review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Submit Manager Decision
  const handleRecordDecision = async () => {
    if (!decisionModal || !decisionReason.trim()) {
      toast.error('A written justification is required for every managerial decision.');
      return;
    }

    setSubmittingDecision(true);
    try {
      const res = await recordDecision(draft.id, decisionModal.type, decisionReason.trim());
      if (res?.error) {
        toast.error(res.error);
        setSubmittingDecision(false);
        return;
      }

      setDraftStatus(decisionModal.type);
      toast.success(`Draft marked as ${decisionModal.type.replace('_', ' ')}!`);
      setDecisionModal(null);
      setDecisionReason('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record decision');
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Submit Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await addComment(draft.id, newCommentBody.trim());
      if (res?.error) {
        toast.error(res.error);
        setSubmittingComment(false);
        return;
      }

      setComments((prev) => [
        ...prev,
        {
          id: `comment-${Date.now()}`,
          draft_id: draft.id,
          body: newCommentBody.trim(),
          created_at: new Date().toISOString(),
          profiles: {
            full_name: 'You',
            role: currentUserRole as Role,
          },
        },
      ]);
      setNewCommentBody('');
      toast.success('Comment posted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Create New Version
  const handleCreateNewVersion = async () => {
    if (!newVersionBody.trim()) return;

    setSubmittingVersion(true);
    try {
      const res = await createNewVersion(draft.id, newVersionBody.trim());
      if (res?.error) {
        toast.error(res.error);
        setSubmittingVersion(false);
        return;
      }

      toast.success(`Created Version ${res.versionNo}! Re-evaluated against rulebook.`);
      setShowNewVersionModal(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create new version');
    } finally {
      setSubmittingVersion(false);
    }
  };

  // Render text with interactive span highlights
  const renderHighlightedContent = () => {
    if (!currentText) return null;

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
      if (span.index > lastIndex) {
        segments.push(
          <span key={`text-${i}`}>{currentText.slice(lastIndex, span.index)}</span>
        );
      }

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
            setActiveTab('findings');
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
      {/* Manager Decision Banner for Compliance Authority */}
      {isManagerOrAdmin && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-sm sm:text-base">Compliance Manager Decision Panel</h2>
              <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">
                {currentUserRole.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Enforce regulatory policies before public dissemination. Select a verdict and record mandatory justification for the audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setDecisionModal({ open: true, type: 'approved' });
                setDecisionReason('Copy fully satisfies PayNest brand guidelines and regulatory disclosures.');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Copy</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDecisionModal({ open: true, type: 'changes_requested' });
                setDecisionReason('Please revise copy according to reviewer suggestions before resubmission.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Request Changes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDecisionModal({ open: true, type: 'rejected' });
                setDecisionReason('Contains non-compliant financial guarantees that cannot be published.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <Ban className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Draft Meta Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold uppercase text-xs">
            {draft.channel}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">Version {version.version_no}</span>
              <StatusBadge status={draftStatus} />
            </div>
            <span className="text-xs text-slate-400">Created {formatDate(draft.created_at)}</span>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('findings')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'findings'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Findings ({openFindings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Comments ({comments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Version Diff</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): The Draft Content Display */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Active Draft Copy</h2>
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
            <span>Click any highlighted span to inspect its citation, reason, and intent-preserving rewrite.</span>
          </div>

          {/* Submission and New Version Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={submittingReview || draftStatus === 'in_review' || draftStatus === 'approved'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submittingReview ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : draftStatus === 'in_review' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Submitted for Review</span>
                </>
              ) : draftStatus === 'approved' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Draft Approved & Locked</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setNewVersionBody(currentText);
                setShowNewVersionModal(true);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-slate-500" />
              <span>Save as New Version & Re-Evaluate</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Tab Content */}
        <div className="lg:col-span-7 space-y-4">
          {/* TAB 1: Findings Workspace */}
          {activeTab === 'findings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Governance Findings ({findings.length})</span>
                </h2>
                <span className="text-xs text-slate-500">
                  {openFindings.length} open • {resolvedFindings.length} resolved
                </span>
              </div>

              {findings.length === 0 ? (
                <div className="bg-white border border-emerald-200 rounded-xl p-8 text-center shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900">Zero Violations Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    This marketing copy strictly aligns with PayNest approved rules, facts, and glossary nomenclature.
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
                        {/* Header */}
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

                        {/* Flagged Span */}
                        <div className="text-xs">
                          <span className="text-slate-400 font-medium block mb-1">Flagged Content Span:</span>
                          <span className="inline-block px-2.5 py-1 bg-red-50 text-red-900 border border-red-200 rounded font-mono font-semibold">
                            "{finding.span_text}"
                          </span>
                        </div>

                        {/* Reason */}
                        <div className="text-xs space-y-1">
                          <span className="text-slate-400 font-medium block">Compliance Reason:</span>
                          <p className="text-slate-700 font-medium leading-relaxed">
                            {finding.reason}
                          </p>
                        </div>

                        {/* Source Citation */}
                        <SourceCitation
                          sourceType={finding.source_type}
                          sourceId={finding.source_id}
                          sourceExcerpt={finding.source_excerpt}
                        />

                        {/* Suggested Fix */}
                        {finding.suggested_fix && (
                          <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-xs space-y-1.5">
                            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              Suggested Intent-Preserving Fix:
                            </span>
                            <p className="text-indigo-900 font-medium bg-white p-2 rounded border border-indigo-200 font-mono">
                              {finding.suggested_fix}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
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

                        {/* Custom Edit Box */}
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

                        {/* Dismissal Box */}
                        {dismissingFindingId === finding.id && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 mt-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <span>Mandatory Dismissal Justification</span>
                            </div>
                            <textarea
                              rows={2}
                              value={dismissReason}
                              onChange={(e) => setDismissReason(e.target.value)}
                              placeholder="State why this finding is being dismissed..."
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
          )}

          {/* TAB 2: Discussion & Comments */}
          {activeTab === 'comments' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Team Discussion & Feedback</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reviewers, creators, and compliance managers communicate feedback on this copy draft.
                </p>
              </div>

              {/* Comments Thread */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    No comments yet. Leave a note or feedback below.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {comment.profiles?.full_name || 'Team Member'}
                          </span>
                          <span className="text-[10px] uppercase font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                            {comment.profiles?.role || 'Reviewer'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 space-y-2">
                <textarea
                  rows={3}
                  value={newCommentBody}
                  onChange={(e) => setNewCommentBody(e.target.value)}
                  placeholder="Leave review feedback or reply to compliance questions..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newCommentBody.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Version Diff */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Version Comparison & Diff</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual word-level diff comparing original draft vs current corrected copy.
                </p>
              </div>

              {allVersions.length > 0 && allVersions[allVersions.length - 1].body !== currentText ? (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Diff: Initial Draft (v1) $\rightarrow$ Active Copy (v{version.version_no}):
                  </span>
                  <DiffView
                    original={allVersions[allVersions.length - 1].body}
                    modified={currentText}
                  />
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center text-xs text-slate-500">
                  <span>Current text is identical to the initial version. Accept fixes or edit text to view live diffs.</span>
                </div>
              )}

              {/* Past Versions List */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Version Archive
                </h4>
                <div className="space-y-2">
                  {allVersions.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>Version {v.version_no} {v.version_no === version.version_no && '(Current)'}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{formatDate(v.created_at)}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 italic">"{v.body}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manager Decision Modal */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 capitalize">
                Confirm {decisionModal.type.replace('_', ' ')}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Regulatory governance requires an explicit written justification for every managerial decision.
              This verdict is permanently sealed into the append-only audit trail.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mandatory Written Justification:
              </label>
              <textarea
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="State regulatory, brand, or factual reasons for this decision..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDecision || !decisionReason.trim()}
                onClick={handleRecordDecision}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                {submittingDecision ? 'Recording Decision...' : 'Confirm Verdict'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save as New Version Modal */}
      {showNewVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">
                Save as New Version & Re-Evaluate
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Creating a new version automatically executes the bounded Review Agent on the revised copy and captures a fresh set of findings.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Revised Content Body:
              </label>
              <textarea
                rows={5}
                value={newVersionBody}
                onChange={(e) => setNewVersionBody(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewVersionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingVersion || !newVersionBody.trim()}
                onClick={handleCreateNewVersion}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                {submittingVersion ? 'Creating Version...' : 'Create Version'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
