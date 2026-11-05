import { createClient } from '../supabase/server';
import { getDemoGlossary, isSupabaseConfigured } from '../demo-data';
import type { Finding } from '@/types/database';

export interface TerminologyCheckResult {
  findings: Array<{
    category: 'terminology';
    severity: 'low';
    span_text: string;
    reason: string;
    source_type: 'glossary';
    source_id: string;
    source_excerpt: string;
    suggested_fix: string;
    start_index: number;
    end_index: number;
  }>;
}

export async function checkTerminology(text: string, orgId: string): Promise<TerminologyCheckResult> {
  let glossary: Array<{ preferred: string; banned: string[]; note?: string | null }> = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from('glossary').select('preferred, banned, note').eq('org_id', orgId);
      if (data && data.length > 0) {
        glossary = data;
      }
    } catch {
      // Fallback
    }
  }

  if (glossary.length === 0) {
    glossary = getDemoGlossary();
  }

  const findings: TerminologyCheckResult['findings'] = [];

  for (const item of glossary) {
    for (const banned of item.banned) {
      // Escape regex special chars
      const escaped = banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // If banned word is mixed-case like Paynest or PN, use case-sensitive or word boundary
      // Otherwise word-boundary case-insensitive
      const isCaseSensitive = banned === 'Paynest' || banned === 'PN';
      const flags = isCaseSensitive ? 'g' : 'gi';
      const regex = new RegExp(`\\b${escaped}\\b`, flags);

      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const spanText = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + spanText.length;

        // Prevent duplicate finding on exact same span
        const alreadyFlagged = findings.some(
          (f) => f.start_index === startIndex && f.end_index === endIndex
        );

        if (!alreadyFlagged) {
          findings.push({
            category: 'terminology',
            severity: 'low',
            span_text: spanText,
            reason: `Use approved terminology "${item.preferred}". "${spanText}" is non-compliant nomenclature.`,
            source_type: 'glossary',
            source_id: `glossary:${item.preferred}`,
            source_excerpt: item.note || `Approved terminology: use "${item.preferred}" instead of "${banned}".`,
            suggested_fix: item.preferred,
            start_index: startIndex,
            end_index: endIndex,
          });
        }
      }
    }
  }

  return { findings };
}
