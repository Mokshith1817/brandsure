'use client';

import React, { useState } from 'react';
import type { GlossaryEntry } from '@/types/database';
import { saveGlossaryEntry, deleteGlossaryEntry } from '@/app/actions/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { Type, Plus, Trash2, Edit3, Check, Ban } from 'lucide-react';
import { toast } from 'sonner';

export function GlossaryClient({ initialEntries }: { initialEntries: GlossaryEntry[] }) {
  const [entries, setEntries] = useState<GlossaryEntry[]>(initialEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GlossaryEntry | null>(null);

  const [preferred, setPreferred] = useState('');
  const [bannedInput, setBannedInput] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setPreferred('');
    setBannedInput('');
    setNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GlossaryEntry) => {
    setEditingItem(item);
    setPreferred(item.preferred);
    setBannedInput(item.banned.join(', '));
    setNote(item.note || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const banned = bannedInput
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    if (banned.length === 0) {
      toast.error('Please enter at least one banned term variation');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await saveGlossaryEntry({
        id: editingItem?.id,
        preferred,
        banned,
        note,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editingItem ? 'Glossary entry updated' : 'Glossary entry created');
        setIsModalOpen(false);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save glossary entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, preferredStr: string) => {
    if (!confirm(`Are you sure you want to delete term "${preferredStr}"?`)) return;

    try {
      const res = await deleteGlossaryEntry(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Glossary entry deleted');
        setEntries(entries.filter((e) => e.id !== id));
      }
    } catch {
      toast.error('Failed to delete glossary entry');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4" />
          <span>Add Glossary Term</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={Type}
          title="No glossary terms"
          description="Define preferred brand words and banned alternatives (e.g. 'members' instead of 'customers')."
          actionLabel="Add Term"
          onActionClick={openAddModal}
        />
      ) : (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded text-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{entry.preferred}</span>
                  </span>

                  <span className="text-slate-400 text-xs font-semibold">REPLACES:</span>

                  {entry.banned.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded line-through opacity-85"
                    >
                      <Ban className="w-3 h-3 text-red-500" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>

                {entry.note && (
                  <p className="text-xs text-slate-500 pl-1">
                    <span className="font-medium text-slate-600">Guidance: </span>
                    {entry.note}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => openEditModal(entry)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                  title="Edit term"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id, entry.preferred)}
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100 transition-colors"
                  title="Delete term"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingItem ? 'Edit Glossary Term' : 'New Glossary Term'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Term
                </label>
                <input
                  type="text"
                  required
                  value={preferred}
                  onChange={(e) => setPreferred(e.target.value)}
                  placeholder="e.g. members"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Banned / Restricted Variations (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={bannedInput}
                  onChange={(e) => setBannedInput(e.target.value)}
                  placeholder="e.g. customers, users, clients"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Separate each banned variant with a comma. Matching is case-insensitive and whole-word.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usage Note / Policy Context
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Refer to people who use PayNest as members to reinforce community focus."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
