import { checkTerminology } from './tools/check_terminology';
import { lookupFact } from './tools/lookup_fact';
import { retrieveGuidelines } from './tools/retrieve_guideline';
import { judgeClaims } from './tools/judge_claim';
import { checkAccessibilityAndFormatting } from './tools/check_accessibility';
import type { Finding, Severity, SourceType } from '@/types/database';

export interface AgentStepTrace {
  step: string;
  tool_name?: string;
  duration_ms: number;
  findings_found: number;
}

export interface ReviewAgentResult {
  findings: Array<{
    category: string;
    severity: Severity;
    span_text: string;
    reason: string;
    source_type: SourceType;
    source_id: string | null;
    source_excerpt: string;
    suggested_fix: string;
    start_index: number;
    end_index: number;
    ai_generated: boolean;
  }>;
  steps: AgentStepTrace[];
  tool_call_count: number;
  duration_ms: number;
}

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export async function runReviewAgent(
  text: string,
  channel: string = 'social',
  orgId: string = 'org-paynest-demo'
): Promise<ReviewAgentResult> {
  const startTime = Date.now();
  const steps: AgentStepTrace[] = [];
  let toolCallCount = 0;

  const rawFindings: Array<{
    category: string;
    severity: Severity;
    span_text: string;
    reason: string;
    source_type: SourceType;
    source_id: string | null;
    source_excerpt: string;
    suggested_fix: string;
    start_index: number;
    end_index: number;
    ai_generated: boolean;
  }> = [];

  // 1. Tool 1: Check Terminology (Glossary matching)
  const t1Start = Date.now();
  toolCallCount++;
  const terminologyRes = await checkTerminology(text, orgId);
  terminologyRes.findings.forEach((f) => {
    rawFindings.push({
      ...f,
      ai_generated: true,
    });
  });
  steps.push({
    step: 'check_terminology',
    tool_name: 'check_terminology',
    duration_ms: Date.now() - t1Start,
    findings_found: terminologyRes.findings.length,
  });

  // 2. Tool 2: Check Facts Base (Numeric / pricing claims)
  const t2Start = Date.now();
  toolCallCount++;
  const factRes = await lookupFact(text, orgId);
  factRes.findings.forEach((f) => {
    rawFindings.push({
      ...f,
      ai_generated: true,
    });
  });
  steps.push({
    step: 'lookup_fact',
    tool_name: 'lookup_fact',
    duration_ms: Date.now() - t2Start,
    findings_found: factRes.findings.length,
  });

  // 3. Tool 3: Retrieve Guidelines (Hybrid vector + FTS)
  const t3Start = Date.now();
  toolCallCount++;
  const retrievedGuidelines = await retrieveGuidelines(text, orgId, 3);
  steps.push({
    step: 'retrieve_guidelines',
    tool_name: 'retrieve_guideline',
    duration_ms: Date.now() - t3Start,
    findings_found: retrievedGuidelines.length,
  });

  // 4. Tool 4: Judge Claims against Retrieved Guidelines
  const t4Start = Date.now();
  toolCallCount++;
  const claimFindings = await judgeClaims(text, retrievedGuidelines);
  claimFindings.forEach((f) => {
    rawFindings.push({
      ...f,
      ai_generated: true,
    });
  });
  steps.push({
    step: 'judge_claims',
    tool_name: 'judge_claim',
    duration_ms: Date.now() - t4Start,
    findings_found: claimFindings.length,
  });

  // 5. Tool 5: Formatting and Accessibility
  const t5Start = Date.now();
  toolCallCount++;
  const formattingFindings = checkAccessibilityAndFormatting(text);
  formattingFindings.forEach((f) => {
    rawFindings.push({
      ...f,
      ai_generated: true,
    });
  });
  steps.push({
    step: 'check_accessibility_and_formatting',
    tool_name: 'check_accessibility',
    duration_ms: Date.now() - t5Start,
    findings_found: formattingFindings.length,
  });

  // 6. Overlap Merging & Deduplication
  // Sort by start_index, then by severity descending
  rawFindings.sort((a, b) => {
    if (a.start_index !== b.start_index) return a.start_index - b.start_index;
    return SEVERITY_WEIGHTS[b.severity] - SEVERITY_WEIGHTS[a.severity];
  });

  const mergedFindings: typeof rawFindings = [];

  for (const candidate of rawFindings) {
    // Check if overlaps significantly with an existing finding
    const existingIndex = mergedFindings.findIndex((f) => {
      const isOverlap =
        Math.max(f.start_index, candidate.start_index) < Math.min(f.end_index, candidate.end_index);
      return isOverlap;
    });

    if (existingIndex === -1) {
      mergedFindings.push(candidate);
    } else {
      const existing = mergedFindings[existingIndex];
      // If candidate has strictly higher severity, replace existing
      if (SEVERITY_WEIGHTS[candidate.severity] > SEVERITY_WEIGHTS[existing.severity]) {
        mergedFindings[existingIndex] = candidate;
      }
    }
  }

  // 7. Strictly verify bounding: every finding must have source citation or fallback to 'none'
  const boundedFindings = mergedFindings.map((f) => {
    if (!f.source_id) {
      return {
        ...f,
        source_type: 'none' as SourceType,
        source_id: null,
        source_excerpt: 'No approved source found.',
      };
    }
    return f;
  });

  return {
    findings: boundedFindings,
    steps,
    tool_call_count: toolCallCount,
    duration_ms: Date.now() - startTime,
  };
}
