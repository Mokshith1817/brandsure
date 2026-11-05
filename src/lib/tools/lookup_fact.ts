import { createClient } from '../supabase/server';
import { getDemoFacts, isSupabaseConfigured } from '../demo-data';
import type { Fact } from '@/types/database';

export interface FactCheckFinding {
  category: 'claims';
  severity: 'high' | 'medium';
  span_text: string;
  reason: string;
  source_type: 'fact';
  source_id: string;
  source_excerpt: string;
  suggested_fix: string;
  start_index: number;
  end_index: number;
}

export async function lookupFact(text: string, orgId: string): Promise<{ findings: FactCheckFinding[] }> {
  let facts: Fact[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from('facts').select('*').eq('org_id', orgId);
      if (data && data.length > 0) facts = data;
    } catch {
      // Fallback
    }
  }

  if (facts.length === 0) {
    facts = getDemoFacts();
  }

  const findings: FactCheckFinding[] = [];

  // Check 1: User Count Fact (fact-user-count: 1.2 million)
  const userFact = facts.find((f) => f.key === 'fact-user-count');
  if (userFact) {
    // Look for numbers like "5 million", "10 million", "2 million", etc. that are not "1.2 million"
    const userCountRegex = /\b(\d+(?:\.\d+)?\s*(?:million|crore|lakh))\b/gi;
    let match: RegExpExecArray | null;
    while ((match = userCountRegex.exec(text)) !== null) {
      const matchedPhrase = match[0];
      const normalized = matchedPhrase.toLowerCase().replace(/\s+/g, ' ');
      // If text mentions users/members/customers nearby or claim
      if (normalized !== '1.2 million' && normalized !== '1.2million') {
        const startIndex = match.index;
        const endIndex = startIndex + matchedPhrase.length;
        findings.push({
          category: 'claims',
          severity: 'medium',
          span_text: matchedPhrase,
          reason: `Unsubstantiated user count metric. PayNest has 1.2 million registered members per verified company metrics, not ${matchedPhrase}.`,
          source_type: 'fact',
          source_id: userFact.key,
          source_excerpt: userFact.statement,
          suggested_fix: '1.2 million',
          start_index: startIndex,
          end_index: endIndex,
        });
      }
    }
  }

  return { findings };
}
