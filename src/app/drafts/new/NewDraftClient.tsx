'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDraft } from '@/app/actions/drafts';
import type { Channel } from '@/types/database';
import {
  Share2,
  Megaphone,
  Mail,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface NewDraftClientProps {
  userRole: string;
}

const CHANNELS: Array<{
  id: Channel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  maxChars?: number;
}> = [
  {
    id: 'social',
    label: 'Social Media',
    icon: Share2,
    description: 'X / LinkedIn / Instagram posts',
    maxChars: 280,
  },
  {
    id: 'ad',
    label: 'Digital Ad Copy',
    icon: Megaphone,
    description: 'Search & display ad headlines and descriptions',
    maxChars: 150,
  },
  {
    id: 'email',
    label: 'Email Newsletter',
    icon: Mail,
    description: 'Promotional and announcement emails',
  },
  {
    id: 'blog',
    label: 'Blog & Editorial',
    icon: BookOpen,
    description: 'Long-form articles and educational guides',
  },
];

const PRESET_SAMPLES = [
  {
    name: 'Flawed Social (Promises & Superlatives)',
    channel: 'social' as Channel,
    text: 'Our app is the fastest in India, guaranteed to double your savings!',
    violations: 'Superlative claim + Guaranteed returns promise',
  },
  {
    name: 'Flawed Ad (Metric Conflict & Banned Term)',
    channel: 'ad' as Channel,
    text: 'Over 5 million customers rely on PayNest for zero transaction fee payments every day.',
    violations: 'Outdated user count (1.2M actual) + Banned word "customers"',
  },
  {
    name: 'Flawed Tone (Technical Glitch Meme)',
    channel: 'social' as Channel,
    text: "Oopsie! Bank servers went RIP lol. Don't worry, Paynest will retry your payment shortly.",
    violations: 'Inappropriate slang + Brand name casing "Paynest"',
  },
  {
    name: 'Clean Social (Compliant Copy)',
    channel: 'social' as Channel,
    text: 'Send money to your family and friends with PayNest. All UPI payments carry zero fees for our members.',
    violations: 'Zero violations • Fully verified facts & terminology',
  },
];

export function NewDraftClient({ userRole }: NewDraftClientProps) {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel>('social');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const activeChannelConfig = CHANNELS.find((c) => c.id === channel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please enter content to evaluate.');
      return;
    }

    setLoading(true);
    try {
      const res = await createDraft({ channel, text });
      if (res?.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success('Draft evaluated successfully against brand guidelines');
      router.push(`/drafts/${res.draftId}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit draft');
      setLoading(false);
    }
  };

  const loadPreset = (preset: typeof PRESET_SAMPLES[0]) => {
    setChannel(preset.channel);
    setText(preset.text);
    toast.info(`Loaded test sample: "${preset.name}"`);
  };

  return (
    <div className="space-y-8">
      {/* Sample Draft Quick-Loader Bar */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-slate-50 to-purple-50/70 p-4 rounded-xl border border-indigo-100 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
            Quick-Load Benchmark Test Samples (Round 2 Evaluation)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(sample)}
              className="p-2.5 bg-white border border-slate-200 rounded-lg text-left hover:border-indigo-400 hover:shadow-xs transition-all group"
            >
              <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate">
                {sample.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {sample.violations}
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Channel Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Marketing Channel
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isSelected = channel === ch.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {ch.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{ch.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="draftText" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Marketing Copy Content
            </label>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>{wordCount} words</span>
              <span>•</span>
              <span className={activeChannelConfig?.maxChars && charCount > activeChannelConfig.maxChars ? 'text-amber-600 font-bold' : ''}>
                {charCount} {activeChannelConfig?.maxChars ? `/ ${activeChannelConfig.maxChars} chars` : 'chars'}
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="draftText"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type marketing copy here (e.g. social post, email headline, digital ad body)..."
              className="w-full p-4 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-sans leading-relaxed shadow-xs"
              required
            />
          </div>
        </div>

        {/* Guardrail Policy Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-start gap-3 text-xs text-slate-600">
          <ShieldAlert className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-800">Bounded Brand Governance Engine</p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              The AI Review Agent strictly verifies text against approved PayNest guidelines, facts, and glossary.
              The AI only suggests fixes; it never approves or alters text automatically.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Compliance Check...</span>
              </>
            ) : (
              <>
                <span>Run Brand & Compliance Check</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
