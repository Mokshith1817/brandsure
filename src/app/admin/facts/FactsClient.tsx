'use client';

import React, { useState } from 'react';
import type { Fact } from '@/types/database';
import { saveFact, deleteFact } from '@/app/actions/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { Database, Plus, Trash2, Edit3, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function FactsClient({ initialFacts }: { initialFacts: Fact[] }) {
  const [facts, setFacts] = useState<Fact[]>(initialFacts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Fact | null>(null);

  const [key, setKey] = useState('');
  const [statement, setStatement] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [asOf, setAsOf] = useState('2026-10-01');
  const [sourceNote, setSourceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setKey('');
    setStatement('');
    setValue('');
    setUnit('');
    setAsOf(new Date().toISOString().slice(0, 10));
    setSourceNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Fact) => {
    setEditingItem(item);
    setKey(item.key);
    setStatement(item.statement);
    setValue(item.value);
    setUnit(item.unit);
    setAsOf(item.as_of);
    setSourceNote(item.source_note || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await saveFact({
        id: editingItem?.id,
        key,
        statement,
        value,
        unit,
        as_of: asOf,
        source_note: sourceNote,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editingItem ? 'Fact updated' : 'Fact created');
        setIsModalOpen(false);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save fact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, keyStr: string) => {
    if (!confirm(`Are you sure you want to delete fact "${keyStr}"?`)) return;

    try {
      const res = await deleteFact(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Fact deleted');
        setFacts(facts.filter((f) => f.id !== id));
      }
    } catch {
      toast.error('Failed to delete fact');
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
          <span>Add Approved Fact</span>
        </button>
      </div>

      {facts.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No approved facts"
          description="Add verified figures, fee structures, and numbers that writers and review agents must reference."
          actionLabel="Add Fact"
          onActionClick={openAddModal}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3 text-left">Fact Key & Statement</th>
                <th scope="col" className="px-4 py-3 text-left">Verified Value</th>
                <th scope="col" className="px-4 py-3 text-left">As of Date</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {facts.map((fact) => (
                <tr key={fact.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 max-w-md">
                    <div className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded w-fit mb-1">
                      {fact.key}
                    </div>
                    <div className="font-medium text-slate-900">{fact.statement}</div>
                    {fact.source_note && (
                      <div className="text-xs text-slate-400 mt-0.5 italic">{fact.source_note}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                      {fact.value} <span className="font-normal text-slate-500 text-xs">{fact.unit}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fact.as_of}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(fact)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                        title="Edit fact"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(fact.id, fact.key)}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100 transition-colors"
                        title="Delete fact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingItem ? 'Edit Approved Fact' : 'New Approved Fact'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fact Key (Unique Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. fact-upi-fee"
                  className="w-full text-sm font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Fact Statement
                </label>
                <textarea
                  required
                  rows={2}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="e.g. UPI payments on PayNest carry zero transaction fees for the user."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 0, 1.2, 2"
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. INR, million, x faster"
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    As-of Date
                  </label>
                  <input
                    type="date"
                    required
                    value={asOf}
                    onChange={(e) => setAsOf(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source Note
                  </label>
                  <input
                    type="text"
                    value={sourceNote}
                    onChange={(e) => setSourceNote(e.target.value)}
                    placeholder="e.g. Internal Benchmark Suite"
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
                  {isSubmitting ? 'Saving...' : 'Save Fact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
