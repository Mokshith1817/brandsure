import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const embeddingModelName = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Generate vector embedding for a single text chunk using Gemini text-embedding-004.
 * Returns 768-dimensional float array or null if failed/unconfigured.
 */
export async function getEmbedding(text: string): Promise<number[] | null> {
  if (!genAI || !apiKey) {
    console.warn('[Embeddings] GEMINI_API_KEY is not set. Skipping vector generation.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: embeddingModelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err: any) {
    console.error('[Embeddings Error]:', err.message);
    return null;
  }
}

/**
 * Split a guideline text into 40-120 word chunks split by blank lines or numbered rules.
 */
export function chunkGuidelineText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];

  // Split on double newlines or numbered lines (e.g. "1.", "2.")
  const rawParts = text
    .split(/\n\s*\n|(?=(?:^|\n)\s*\d+\.\s+)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];

  for (const part of rawParts) {
    const words = part.split(/\s+/);
    if (words.length <= 130) {
      chunks.push(part);
    } else {
      // Split large blocks into sub-chunks of ~80 words
      for (let i = 0; i < words.length; i += 80) {
        const subChunk = words.slice(i, i + 80).join(' ');
        if (subChunk.trim().length > 0) {
          chunks.push(subChunk.trim());
        }
      }
    }
  }

  return chunks.length > 0 ? chunks : [text.trim()];
}
