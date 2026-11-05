import { createClient } from '../supabase/server';
import { getDemoGuidelines, isSupabaseConfigured } from '../demo-data';
import { getEmbedding } from '../embeddings';

export interface RetrievedGuideline {
  id: string;
  key: string;
  title: string;
  text: string;
  category: string;
  similarity: number;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordOverlapScore(query: string, target: string): number {
  const queryTokens = new Set(query.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
  const targetTokens = new Set(target.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);

  if (queryTokens.size === 0 || targetTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of queryTokens) {
    if (targetTokens.has(token)) intersection++;
  }

  return intersection / Math.sqrt(queryTokens.size * targetTokens.size);
}

export async function retrieveGuidelines(
  query: string,
  orgId: string,
  limit: number = 3
): Promise<RetrievedGuideline[]> {
  const guidelines = getDemoGuidelines();

  // Try live pgvector + FTS search if Supabase is connected
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const embedding = await getEmbedding(query);

      if (embedding) {
        const { data: vectorResults } = await supabase.rpc('match_guideline_chunks', {
          query_embedding: embedding,
          p_org_id: orgId,
          k: limit,
        });

        if (vectorResults && vectorResults.length > 0) {
          const guidelineIds = vectorResults.map((r: any) => r.guideline_id);
          const { data: matchedGuidelines } = await supabase
            .from('guidelines')
            .select('*')
            .in('id', guidelineIds);

          if (matchedGuidelines && matchedGuidelines.length > 0) {
            return matchedGuidelines.map((g: any, idx: number) => ({
              id: g.id,
              key: g.key || g.id,
              title: g.title,
              text: g.text,
              category: g.category,
              similarity: vectorResults[idx]?.similarity || 0.8,
            }));
          }
        }
      }
    } catch (err) {
      console.warn('[retrieveGuidelines Live Error]:', err);
    }
  }

  // Fallback hybrid scoring over in-memory guidelines
  const scored = guidelines.map((g) => {
    const combinedContent = `${g.title} ${g.text} ${g.category}`;
    const kwScore = keywordOverlapScore(query, combinedContent);
    return {
      id: g.id,
      key: g.key || g.id,
      title: g.title,
      text: g.text,
      category: g.category,
      similarity: kwScore,
    };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, limit);
}
