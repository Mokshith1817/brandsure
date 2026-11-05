'use client';

import React, { useState } from 'react';
import { saveGuideline, deleteGuideline, reindexGuideline } from '@/app/actions/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen, Plus, Trash2, Edit3, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GuidelineItem {
  id: string;
  title: string;
  text: string;
  category: string;
  created_at: string;
  guideline_chunks?: Array<{ id: string; embedding?: number[] | null }>;
}

export function GuidelinesClient({ initialGuidelines }: { initialGuidelines: GuidelineItem[] }) {
  const [guidelines, setGuidelines] = useState<GuidelineItem[]>(initialGuidelines);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GuidelineItem | null>(null);

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState('claims');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indexingId, setIndexingId] = useState<string | null>(null);

  const categories = [
    'financial-promises',
    'claims',
    'tone',
    'accessibility',
    'terminology',
    'formatting',
    'other',
  ];

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setText('');
    setCategory('claims');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GuidelineItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setText(item.text);
    setCategory(item.category);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await saveGuideline({
        id: editingItem?.id,
        title,
        text,
        category,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editingItem ? 'Guideline updated and re-indexed' : 'Guideline created and indexed');
        setIsModalOpen(false);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save guideline');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (!confirm(`Are you sure you want to delete guideline "${titleStr}"?`)) return;

    try {
      const res = await deleteGuideline(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Guideline deleted');
        setGuidelines(guidelines.filter((g) => g.id !== id));
      }
    } catch {
      toast.error('Failed to delete guideline');
    }
  };

  const handleReindex = async (id: string) => {
    setIndexingId(id);
    try {
      const res = await reindexGuideline(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Re-indexed: ${res.chunksCount} chunks (${res.indexedWithEmbeddings} with vector embeddings)`);
      }
    } catch {
      toast.error('Failed to re-index');
    } finally {
      setIndexingId(null);
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
          <span>Add Guideline</span>
        </button>
      </div>

      {guidelines.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No guidelines yet"
          description="Add approved brand rules to guide the automated review agent during pre-publication checks."
          actionLabel="Add Guideline"
          onActionClick={openAddModal}
        />
      ) : (
        <div className="grid gap-4">
          {guidelines.map((g) => {
            const chunksCount = g.guideline_chunks?.length || 0;
            const hasEmbeddings = g.guideline_chunks?.some((c) => c.embedding !== null);

            return (
              <div
                key={g.id}
                className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                      {g.category}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">{g.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {hasEmbeddings ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>{chunksCount} Vector Chunks</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>{chunksCount} Text Chunks (FTS only)</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleReindex(g.id)}
                      disabled={indexingId === g.id}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-50 transition-colors"
                      title="Re-index vector embeddings"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${indexingId === g.id ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(g)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-50 transition-colors"
                      title="Edit guideline"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.id, g.title)}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded hover:bg-slate-50 transition-colors"
                      title="Delete guideline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded border border-slate-100">
                  {g.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingItem ? 'Edit Guideline' : 'New Guideline'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guideline Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Prohibition of Guaranteed Returns"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Policy Text
                </label>
                <textarea
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="State the exact policy rule. Use numbered lists or paragraphs for multiple sub-rules..."
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Text will be automatically chunked and indexed into vector search.
                </p>
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
                  {isSubmitting ? 'Saving & Indexing...' : 'Save Guideline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
