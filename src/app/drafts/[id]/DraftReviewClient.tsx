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
import { StatusStepper } from '@/components/ui/StatusStepper';
import { NextStepBanner } from '@/components/ui/NextStepBanner';
import { GuidedTour } from '@/components/ui/GuidedTour';
import { AgentProgressTimeline } from '@/components/ui/AgentProgressTimeline';
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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Undo2,
  Eye,
  SlidersHorizontal,
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
  const [expandedResolvedId, setExpandedResolvedId] = useState<string | null>(null);

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

  // Tour and Trace state
  const [showTour, setShowTour] = useState(false);
  const [showTrace, setShowTrace] = useState(false);

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

  // Handle Undo / Reopen Finding
  const handleUndoFinding = async (finding: Finding) => {
    try {
      const res = await updateFindingDisposition({
        draftId: draft.id,
        findingId: finding.id,
        status: 'open',
        decisionReason: undefined,
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      setFindings((prev) =>
        prev.map((f) =>
          f.id === finding.id ? { ...f, status: 'open', decision_reason: null } : f
        )
      );
      toast.info('Finding reopened for review');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reopen finding');
    }
  };

  // Submit Draft for Review
  const handleSubmitForReview = async () => {
    if (counts.high > 0) {
      toast.error(
        `Cannot submit for review: ${counts.high} HIGH severity finding(s) are still open. Please accept, edit, or dismiss them with a justification.`
      );
      return;
    }

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

  // Bi-directional click handlers
  const handleSpanClick = (findingId: string) => {
    setSelectedFindingId(findingId);
    setActiveTab('findings');
    const el = document.getElementById(`finding-card-${findingId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('animate-pulse-card');
      void el.offsetWidth;
      el.classList.add('animate-pulse-card');
    }
  };

  const handleCardClick = (findingId: string) => {
    setSelectedFindingId(findingId);
    const spanEl = document.getElementById(`span-${findingId}`);
    if (spanEl) {
      spanEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          id={`span-${span.id}`}
          onClick={() => handleSpanClick(span.id)}
          className={`px-1.5 py-0.5 rounded transition-all cursor-pointer inline-block ${
            severityStyles[span.severity]
          }`}
          title={`Click to inspect issue: ${span.span_text}`}
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

  // Next Step banner calculations
  let nextStepInfo: {
    statusTitle: string;
    explanation: string;
    actionText: string;
    variant: 'info' | 'success' | 'warning';
    actionHref?: string;
    onActionClick?: () => void;
  } = {
    statusTitle: 'Resolve High-Severity Items',
    explanation: `${counts.high} high-severity issue(s) remain open. You must accept or edit the suggested fix, or provide a written dismissal waiver before submitting.`,
    actionText: 'Scroll to Open Issues',
    variant: 'warning',
    onActionClick: () => {
      const firstHigh = openFindings.find((f) => f.severity === 'high');
      if (firstHigh) {
        handleSpanClick(firstHigh.id);
      }
    },
  };

  if (counts.high === 0 && openFindings.length > 0) {
    nextStepInfo = {
      statusTitle: 'Review Remaining Items or Submit',
      explanation: 'All high-severity rules are satisfied. You may accept the remaining suggestions or submit your draft directly to the review queue.',
      actionText: 'Submit for Review',
      variant: 'info',
      onActionClick: handleSubmitForReview,
    };
  } else if (openFindings.length === 0 && draftStatus === 'checked') {
    nextStepInfo = {
      statusTitle: 'All Compliance Checks Passed',
      explanation: 'Zero open compliance issues remain in this draft version. Submit your copy for team review and compliance sign-off.',
      actionText: 'Submit for Review',
      variant: 'success',
      onActionClick: handleSubmitForReview,
    };
  } else if (draftStatus === 'in_review') {
    nextStepInfo = {
      statusTitle: 'Waiting for Team Review',
      explanation: 'Your draft has been submitted. Reviewers can leave comments, and the compliance manager will review and approve.',
      actionText: 'View Comments',
      variant: 'info',
      onActionClick: () => setActiveTab('comments'),
    };
  } else if (draftStatus === 'approved') {
    nextStepInfo = {
      statusTitle: 'Approved for Publication',
      explanation: 'This draft has been officially approved by the Compliance Manager. Content is locked and ready for digital marketing distribution.',
      actionText: 'Create Another Draft',
      variant: 'success',
      actionHref: '/drafts/new',
    };
  } else if (draftStatus === 'changes_requested') {
    nextStepInfo = {
      statusTitle: 'Changes Requested by Manager',
      explanation: 'The compliance manager requested revisions. Review their written justification, edit your text, and save as a new version.',
      actionText: 'Revise Draft Text',
      variant: 'warning',
      onActionClick: () => setShowNewVersionModal(true),
    };
  }

  return (
    <div className="space-y-6">
      {/* Guided Tour Modal */}
      <GuidedTour forceOpen={showTour} onClose={() => setShowTour(false)} />

      {/* Manager Decision Banner for Compliance Authority */}
      {isManagerOrAdmin && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all tap-target-44 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all tap-target-44 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all tap-target-44 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <Ban className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress Stepper & Next Step Banner */}
      <StatusStepper status={draftStatus} />
      <NextStepBanner {...nextStepInfo} />

      {/* Collapsible Verification Timeline */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <button
          type="button"
          onClick={() => setShowTrace(!showTrace)}
          className="inline-flex items-center gap-1.5 font-medium hover:text-indigo-600 transition-colors tap-target-44"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
          <span>{showTrace ? 'Hide verification engine trace' : 'Show verification engine trace'}</span>
          {showTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => setShowTour(true)}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors tap-target-44"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>How does review work?</span>
        </button>
      </div>

      {showTrace && <AgentProgressTimeline isSimulated={false} />}

      {/* Main Two-Column Review Layout (Desktop: 5 cols / 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Draft Text & Highlighting */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 sticky lg:top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Submitted Marketing Copy</h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Version {version.version_no} • {currentText.length} chars
            </span>
          </div>

          {/* Interactive Highlighted Copy Area */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-lg min-h-[180px] focus-within:ring-2 focus-within:ring-indigo-500">
            {renderHighlightedContent()}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Click any highlighted phrase to jump directly to its explanation and suggested fix.</span>
          </div>

          {/* Submission and Version Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={submittingReview || draftStatus === 'in_review' || draftStatus === 'approved'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-all tap-target-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors tap-target-44"
            >
              <GitBranch className="w-3.5 h-3.5 text-slate-500" />
              <span>Save as New Version & Re-Evaluate</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Tab Content */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('findings')}
              className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 tap-target-44 ${
                activeTab === 'findings'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Problems Found ({openFindings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 tap-target-44 ${
                activeTab === 'comments'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Comments ({comments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 tap-target-44 ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Version History ({allVersions.length || 1})</span>
            </button>
          </div>

          {/* TAB 1: Findings Workspace */}
          {activeTab === 'findings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Summary:</span>
                  <span className="text-[11px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-semibold">
                    {counts.high} High
                  </span>
                  <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                    {counts.medium} Medium
                  </span>
                  <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                    {counts.low} Low
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {openFindings.length} open • {resolvedFindings.length} resolved
                </span>
              </div>

              {findings.length === 0 ? (
                <div className="bg-white border border-emerald-200 rounded-xl p-8 text-center shadow-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900">Zero Problems Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    This marketing copy strictly aligns with PayNest approved guidelines, verified facts, and glossary terminology.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {findings.map((finding) => {
                    const isSelected = selectedFindingId === finding.id;
                    const isOpen = finding.status === 'open';
                    const isExpandedResolved = expandedResolvedId === finding.id;

                    // If finding is resolved and not manually expanded, show clean collapsed row
                    if (!isOpen && !isExpandedResolved) {
                      return (
                        <div
                          key={finding.id}
                          id={`finding-card-${finding.id}`}
                          className="bg-slate-50/80 rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 text-xs transition-all hover:bg-slate-100"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-slate-800 capitalize">
                              {finding.status === 'accepted'
                                ? 'Accepted Fix'
                                : finding.status === 'edited'
                                ? 'Custom Edit Applied'
                                : 'Dismissed with Justification'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-slate-600 truncate max-w-[220px]">
                              "{finding.span_text}"
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUndoFinding(finding)}
                              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 tap-target-44 px-2"
                              title="Reopen this finding"
                            >
                              Undo
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedResolvedId(finding.id)}
                              className="text-[11px] text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                            >
                              Show details
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={finding.id}
                        id={`finding-card-${finding.id}`}
                        onClick={() => handleCardClick(finding.id)}
                        className={`bg-white rounded-xl border p-5 shadow-xs transition-all space-y-4 ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                            : isOpen
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-200 bg-slate-50/60'
                        }`}
                      >
                        {/* Card Top Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {finding.category}
                            </span>
                            <SeverityBadge severity={finding.severity} />
                            <AIBadge />
                          </div>

                          <div className="flex items-center gap-2">
                            {!isOpen && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedResolvedId(null);
                                }}
                                className="text-[11px] text-slate-400 hover:text-slate-600"
                              >
                                Collapse
                              </button>
                            )}
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
                        </div>

                        {/* Flagged Span */}
                        <div className="text-xs">
                          <span className="text-slate-400 font-medium block mb-1">Problem detected in copy:</span>
                          <span className="inline-block px-2.5 py-1 bg-red-50 text-red-900 border border-red-200 rounded font-mono font-semibold">
                            "{finding.span_text}"
                          </span>
                        </div>

                        {/* Reason in Plain Language */}
                        <div className="text-xs space-y-1">
                          <span className="text-slate-400 font-medium block">Why this matters:</span>
                          <p className="text-slate-700 font-medium leading-relaxed">{finding.reason}</p>
                        </div>

                        {/* Expandable Source Citation (Progressive Disclosure) */}
                        <SourceCitation
                          sourceType={finding.source_type}
                          sourceId={finding.source_id}
                          sourceExcerpt={finding.source_excerpt}
                        />

                        {/* Suggested Fix */}
                        {finding.suggested_fix && (
                          <div className="bg-indigo-50/50 p-3.5 rounded-lg border border-indigo-100 text-xs space-y-1.5">
                            <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              Suggested Safer Rewrite:
                            </span>
                            <p className="text-indigo-900 font-medium bg-white p-2.5 rounded border border-indigo-200 font-mono">
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptFinding(finding);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors tap-target-44"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept Fix</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFindingId(finding.id);
                                  setCustomFixText(finding.suggested_fix || finding.span_text);
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors tap-target-44"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit Fix</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDismissingFindingId(finding.id);
                                setDismissReason('');
                              }}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 p-2 rounded transition-colors tap-target-44"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Dismiss</span>
                            </button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-100 text-xs bg-slate-50 p-2.5 rounded text-slate-600 flex items-center justify-between">
                            <div className="space-y-0.5">
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
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUndoFinding(finding);
                              }}
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline tap-target-44 px-2"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              <span>Undo</span>
                            </button>
                          </div>
                        )}

                        {/* Inline Custom Edit Box */}
                        {editingFindingId === finding.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-lg space-y-2 mt-2 animate-fade-in-up"
                          >
                            <label className="text-xs font-bold text-indigo-950 block">
                              Custom Replacement for "{finding.span_text}":
                            </label>
                            <input
                              type="text"
                              value={customFixText}
                              onChange={(e) => setCustomFixText(e.target.value)}
                              className="w-full text-xs p-2.5 bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingFindingId(null)}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveCustomEdit(finding)}
                                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                              >
                                Apply Edit
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Inline Dismiss Justification Box */}
                        {dismissingFindingId === finding.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2 mt-2 animate-fade-in-up"
                          >
                            <label className="text-xs font-bold text-amber-950 block">
                              Mandatory Written Justification for Dismissal:
                            </label>
                            <textarea
                              rows={2}
                              value={dismissReason}
                              onChange={(e) => setDismissReason(e.target.value)}
                              placeholder="e.g. Legal waiver approved by brand compliance team (#304)"
                              className="w-full text-xs p-2 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setDismissingFindingId(null)}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmDismiss(finding)}
                                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs"
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

          {/* TAB 2: Team Comments Discussion */}
          {activeTab === 'comments' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Reviewer & Manager Discussion</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">{comments.length} comments</span>
              </div>

              {comments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No comments yet. Reviewers and managers can add editorial feedback below.
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {c.profiles?.full_name || 'Team Member'}
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {c.profiles?.role || 'team'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-slate-100">
                <textarea
                  rows={2}
                  value={newCommentBody}
                  onChange={(e) => setNewCommentBody(e.target.value)}
                  placeholder="Leave an editorial comment for the creator..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newCommentBody.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 tap-target-44"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Version History & Visual DiffView */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Version Iteration & Diff Tracking</h3>
                </div>
                <span className="text-xs text-slate-400">Comparing Version {version.version_no}</span>
              </div>

              {allVersions.length <= 1 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                  <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  This is the initial version (v1). Save revised edits to compare changes with visual diffing.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-800">
                    Changes from Previous Version:
                  </div>
                  <DiffView
                    original={allVersions[1]?.body || ''}
                    modified={currentText}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manager Decision Modal */}
      {decisionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base capitalize">
                  Record Managerial Verdict: {decisionModal.type.replace('_', ' ')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="text-slate-400 hover:text-slate-600 tap-target-44 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 block">
                Mandatory Written Justification (Permanent in Audit Log):
              </label>
              <textarea
                rows={3}
                required
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Explain the regulatory or editorial rationale for this verdict..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg tap-target-44"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingDecision || !decisionReason.trim()}
                onClick={handleRecordDecision}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs tap-target-44 disabled:opacity-50 ${
                  decisionModal.type === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : decisionModal.type === 'changes_requested'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {submittingDecision ? 'Recording...' : `Confirm ${decisionModal.type.replace('_', ' ')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Version Modal */}
      {showNewVersionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Save as Version {(version.version_no || 1) + 1} & Re-Evaluate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewVersionModal(false)}
                className="text-slate-400 hover:text-slate-600 tap-target-44 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 block">
                Revised Draft Content:
              </label>
              <textarea
                rows={5}
                required
                value={newVersionBody}
                onChange={(e) => setNewVersionBody(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
              <p className="text-[11px] text-slate-500">
                Saving will create an immutable revision snapshot and automatically run compliance checks against the approved rulebook.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewVersionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg tap-target-44"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingVersion || !newVersionBody.trim()}
                onClick={handleCreateNewVersion}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs tap-target-44 disabled:opacity-50"
              >
                {submittingVersion ? 'Evaluating...' : 'Save & Check Version'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
