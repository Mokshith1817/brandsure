'use client';

import React, { useState, useMemo } from 'react';
import type { AuditLogEntry, ActorType } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Bot,
  Cpu,
  Code,
  X,
  Copy,
  Check,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLogClientProps {
  logs: (AuditLogEntry & { actor_name?: string })[];
}

export function AuditLogClient({ logs }: AuditLogClientProps) {
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<(AuditLogEntry & { actor_name?: string }) | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (actorFilter !== 'all' && log.actor_type !== actorFilter) {
        return false;
      }
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const matchesAction = log.action.toLowerCase().includes(q);
      const matchesEntity = log.entity_type.toLowerCase().includes(q) || log.entity_id.toLowerCase().includes(q);
      const matchesActor = (log.actor_name || log.actor_type).toLowerCase().includes(q);
      const matchesDetail = JSON.stringify(log.detail || {}).toLowerCase().includes(q);

      return matchesAction || matchesEntity || matchesActor || matchesDetail;
    });
  }, [logs, actorFilter, search]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied payload to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActorBadge = (type: ActorType, name?: string) => {
    switch (type) {
      case 'user':
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{name || 'User'}</span>
          </div>
        );
      case 'ai_agent':
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Review Agent</span>
          </div>
        );
      case 'system':
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span>System</span>
          </div>
        );
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created') || action.includes('approved') || action.includes('seeded')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('rejected') || action.includes('deleted')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (action.includes('updated') || action.includes('edited') || action.includes('changes_requested')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (action.includes('checked') || action.includes('finding') || action.includes('agent')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Immutability & Compliance Guarantee Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
        <div className="p-2 bg-emerald-100 rounded-md text-emerald-700 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
            Append-Only Non-Repudiation Guarantee
            <span className="text-[11px] font-normal bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full">
              PostgreSQL Trigger Active
            </span>
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
            Every AI agent analysis, user finding disposition, and management approval is permanently recorded with a timestamp.
            The database trigger <code className="bg-emerald-100 px-1 py-0.5 rounded text-[11px] font-mono">trg_audit_log_append_only</code> strictly prevents any modification or deletion.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, actor, entity ID, or payload content..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Actor:</span>
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Actors ({logs.length})</option>
            <option value="user">Users Only</option>
            <option value="ai_agent">AI Agent Only</option>
            <option value="system">System Only</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Audit Entries Found"
          description={
            search || actorFilter !== 'all'
              ? 'No audit log records match your active search or filter criteria.'
              : 'Audit events will appear here automatically as drafts are submitted, analyzed, and approved.'
          }
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((entry) => {
                  const summaryText = entry.detail
                    ? Object.entries(entry.detail)
                        .slice(0, 2)
                        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                        .join(' | ')
                    : '—';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActorBadge(entry.actor_type, entry.actor_name)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadgeColor(
                            entry.action
                          )}`}
                        >
                          {entry.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800">{entry.entity_type}</span>
                          <span className="text-slate-400 font-mono text-[11px] ml-1.5" title={entry.entity_id}>
                            #{entry.entity_id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title={summaryText}>
                        {summaryText}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(entry)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>Payload</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredLogs.length} of {logs.length} logged events</span>
            <span className="text-[11px]">Chronological descending order</span>
          </div>
        </div>
      )}

      {/* JSON Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Audit Entry Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Action</span>
                  <span className="font-semibold text-slate-800">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Actor</span>
                  <span className="font-semibold text-slate-800">
                    {selectedLog.actor_name || selectedLog.actor_type} ({selectedLog.actor_type})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Entity</span>
                  <span className="font-mono text-slate-800">
                    {selectedLog.entity_type} ({selectedLog.entity_id})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Timestamp</span>
                  <span className="font-mono text-slate-800">{formatDate(selectedLog.created_at)}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">JSON Payload:</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(selectedLog.detail, null, 2), selectedLog.id)
                    }
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-2 py-1 rounded"
                  >
                    {copiedId === selectedLog.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-72">
                  {JSON.stringify(selectedLog.detail, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
