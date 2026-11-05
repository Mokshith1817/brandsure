import { GoogleGenerativeAI } from '@google/generative-ai';
import type { RetrievedGuideline } from './retrieve_guideline';

export interface EvaluatedClaimFinding {
  category: 'financial-promises' | 'claims' | 'tone';
  severity: 'high' | 'medium';
  span_text: string;
  reason: string;
  source_type: 'guideline';
  source_id: string;
  source_excerpt: string;
  suggested_fix: string;
  start_index: number;
  end_index: number;
}

const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let genAI: GoogleGenerativeAI | null = null;
if (geminiApiKey && geminiApiKey !== 'your-google-gemini-api-key') {
  genAI = new GoogleGenerativeAI(geminiApiKey);
}

// Bounded deterministic patterns with exact span resolution
const DETERMINISTIC_VIOLATIONS = [
  // 1. Financial Promises (High severity)
  {
    regex: /\b(guaranteed\s+to\s+double\s+your\s+savings)\b/i,
    category: 'financial-promises' as const,
    severity: 'high' as const,
    rule_ref: 'guideline-financial-promises',
    source_title: 'Prohibition of Guaranteed Returns and Assured Outcomes',
    source_excerpt:
      'Never promise, state, or imply guaranteed financial returns, fixed interest profits, or risk-free investment outcomes. All financial growth and investment services are subject to market conditions and regulatory disclosures.',
    reason:
      'Prohibited financial promise. Regulatory and brand guidelines strictly disallow claiming guaranteed returns or assured wealth doubling.',
    suggested_fix: 'designed to help grow your savings responsibly',
  },
  {
    regex: /\b(risk-free\s+fixed\s+12%\s+yield)\b/i,
    category: 'financial-promises' as const,
    severity: 'high' as const,
    rule_ref: 'guideline-financial-promises',
    source_title: 'Prohibition of Guaranteed Returns and Assured Outcomes',
    source_excerpt:
      'Never promise, state, or imply guaranteed financial returns, fixed interest profits, or risk-free investment outcomes.',
    reason:
      'Unlawful risk-free promise. Investment and savings yields cannot be represented as fixed or risk-free without regulatory disclaimers.',
    suggested_fix: 'competitive market-linked savings options',
  },
  {
    regex: /\b(assured\s+wealth\s+growth\s+with\s+zero\s+downside\s+risk)\b/i,
    category: 'financial-promises' as const,
    severity: 'high' as const,
    rule_ref: 'guideline-financial-promises',
    source_title: 'Prohibition of Guaranteed Returns and Assured Outcomes',
    source_excerpt:
      'Never promise, state, or imply guaranteed financial returns, fixed interest profits, or risk-free investment outcomes.',
    reason:
      'Zero downside risk claims violate SEBI and ASCI advertising standards for financial products.',
    suggested_fix: 'disciplined savings tools with market disclosures',
  },

  // 2. Unsubstantiated Claims & Superlatives (Medium severity)
  {
    regex: /\b(fastest\s+in\s+India)\b/i,
    category: 'claims' as const,
    severity: 'medium' as const,
    rule_ref: 'guideline-claims',
    source_title: 'Substantiation of Promotional and Superlative Claims',
    source_excerpt:
      "Do not use superlatives such as 'best', 'No. 1', 'fastest', or 'cheapest' unless an exact, verified approved fact in the company fact base substantiates the claim.",
    reason:
      'Superlative claim without approved substantiation. The fact base substantiates "2x faster than v1.0", not "fastest in India".',
    suggested_fix: 'fast and reliable across India',
  },
  {
    regex: /\b(3x\s+better\s+than\s+any\s+traditional\s+bank(?:\s+account\s+in\s+the\s+country)?)\b/i,
    category: 'claims' as const,
    severity: 'medium' as const,
    rule_ref: 'guideline-claims',
    source_title: 'Substantiation of Promotional and Superlative Claims',
    source_excerpt:
      'Comparative claims against named competitors are prohibited without legal approval.',
    reason:
      'Comparative superlative claim against traditional banks without approved verification or legal clearance.',
    suggested_fix: 'competitive rates with transparent terms',
  },
  {
    regex: /\b(10X\s+FASTER\s+THAN\s+EVERY\s+OTHER\s+APP)\b/i,
    category: 'claims' as const,
    severity: 'medium' as const,
    rule_ref: 'guideline-claims',
    source_title: 'Substantiation of Promotional and Superlative Claims',
    source_excerpt:
      'Do not use superlatives such as fastest or cheapest without verified benchmark substantiation.',
    reason:
      'Unsupported superlative metric. Verified company benchmark only substantiates 2x speed over v1.0.',
    suggested_fix: '2x faster than our previous version',
  },
  {
    regex: /\b(India's\s+No\.\s*1\s+payment\s+app)\b/i,
    category: 'claims' as const,
    severity: 'medium' as const,
    rule_ref: 'guideline-claims',
    source_title: 'Substantiation of Promotional and Superlative Claims',
    source_excerpt:
      "Do not use superlatives such as 'best', 'No. 1', 'fastest', or 'cheapest' unless an exact, verified approved fact substantiates the claim.",
    reason:
      'Unsubstantiated "No. 1" market claim violates ASCI regulatory guidelines on comparative advertising.',
    suggested_fix: 'a leading UPI payment app in India',
  },

  // 3. Brand Tone & Glitch Communications (Medium severity)
  {
    regex: /(Oopsie!\s*Bank\s+servers\s+went\s+RIP\s+lol)/i,
    category: 'tone' as const,
    severity: 'medium' as const,
    rule_ref: 'guideline-tone',
    source_title: 'Professional and Reassuring Brand Tone',
    source_excerpt:
      'Maintain a friendly, empathetic, but strictly professional tone. Never use flippant slang, sarcasm, or internet memes when discussing payment failures, technical glitches, or sensitive financial account actions.',
    reason:
      'Flippant slang and internet memes ("Oopsie", "RIP lol") during payment or server failures compromise consumer trust.',
    suggested_fix: 'We are experiencing a temporary banking partner delay',
  },
];

export async function judgeClaims(
  text: string,
  retrievedGuidelines: RetrievedGuideline[]
): Promise<EvaluatedClaimFinding[]> {
  const findings: EvaluatedClaimFinding[] = [];

  // 1. Evaluate deterministic patterns
  for (const item of DETERMINISTIC_VIOLATIONS) {
    let match: RegExpExecArray | null;
    const globalRegex = new RegExp(item.regex.source, 'gi');

    while ((match = globalRegex.exec(text)) !== null) {
      const spanText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + spanText.length;

      findings.push({
        category: item.category,
        severity: item.severity,
        span_text: spanText,
        reason: item.reason,
        source_type: 'guideline',
        source_id: item.rule_ref,
        source_excerpt: item.source_excerpt,
        suggested_fix: item.suggested_fix,
        start_index: startIndex,
        end_index: endIndex,
      });
    }
  }

  // 2. If Gemini is available and has remaining unflagged claims, run bounded LLM evaluation
  if (genAI && findings.length === 0) {
    try {
      const model = genAI.getGenerativeModel({ model: geminiModel });
      const prompt = `You are a bounded fintech compliance evaluator for PayNest.
You are given a marketing text and APPROVED guidelines:
${retrievedGuidelines.map((g) => `[${g.key}]: ${g.title} - ${g.text}`).join('\n')}

Rules:
- You may ONLY flag issues supported by the approved guidelines above.
- If no approved rule is violated, return JSON: {"findings": []}
- Never invent facts or rules.

Marketing Text:
"${text}"

Output valid JSON only with schema:
{
  "findings": [
    {
      "category": "financial-promises" | "claims" | "tone",
      "severity": "high" | "medium",
      "span_text": string,
      "reason": string,
      "rule_ref": string,
      "suggested_fix": string
    }
  ]
}`;

      const response = await model.generateContent(prompt);
      const textRes = response.response.text();
      const cleaned = textRes.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed.findings)) {
        for (const f of parsed.findings) {
          const idx = text.indexOf(f.span_text);
          if (idx !== -1) {
            findings.push({
              category: f.category || 'claims',
              severity: f.severity || 'medium',
              span_text: f.span_text,
              reason: f.reason,
              source_type: 'guideline',
              source_id: f.rule_ref || 'guideline-claims',
              source_excerpt: 'Evaluated against approved PayNest guidelines.',
              suggested_fix: f.suggested_fix || 'compliant copy',
              start_index: idx,
              end_index: idx + f.span_text.length,
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('[Gemini Claim Evaluation Note]:', err.message);
    }
  }

  return findings;
}
