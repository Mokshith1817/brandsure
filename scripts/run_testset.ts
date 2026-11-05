import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} else {
  dotenv.config();
}

import { runReviewAgent } from '../src/lib/agent';

interface ExpectedFinding {
  category: string;
  span_text: string;
  rule_ref: string;
}

interface TestDraft {
  id: string;
  channel: string;
  text: string;
  expected_findings: ExpectedFinding[];
  is_clean: boolean;
}

async function runBenchmark() {
  console.log('🧪 Starting BrandSure Benchmark Suite (12 Test Drafts)...\n');

  const draftsPath = path.resolve(process.cwd(), 'seed/test_drafts.json');
  const drafts: TestDraft[] = JSON.parse(fs.readFileSync(draftsPath, 'utf8'));

  let totalExpected = 0;
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  const testResults: any[] = [];

  for (const draft of drafts) {
    const res = await runReviewAgent(draft.text, draft.channel);
    totalExpected += draft.expected_findings.length;

    const matchedExpectedIndices = new Set<number>();
    const matchedAgentIndices = new Set<number>();

    // Compare findings
    draft.expected_findings.forEach((exp, expIdx) => {
      const matchIdx = res.findings.findIndex((actual, actIdx) => {
        if (matchedAgentIndices.has(actIdx)) return false;

        const ruleMatches =
          actual.source_id === exp.rule_ref ||
          (actual.source_id && actual.source_id.includes(exp.rule_ref)) ||
          (exp.rule_ref && exp.rule_ref.includes(actual.source_id || ''));

        const spanMatches =
          actual.span_text.toLowerCase().includes(exp.span_text.toLowerCase()) ||
          exp.span_text.toLowerCase().includes(actual.span_text.toLowerCase());

        return ruleMatches && spanMatches;
      });

      if (matchIdx !== -1) {
        matchedExpectedIndices.add(expIdx);
        matchedAgentIndices.add(matchIdx);
        truePositives++;
      } else {
        falseNegatives++;
      }
    });

    // Unmatched agent findings are false positives
    res.findings.forEach((_, actIdx) => {
      if (!matchedAgentIndices.has(actIdx)) {
        falsePositives++;
      }
    });

    const isDraftPassed =
      matchedExpectedIndices.size === draft.expected_findings.length &&
      matchedAgentIndices.size === res.findings.length;

    testResults.push({
      id: draft.id,
      channel: draft.channel,
      is_clean: draft.is_clean,
      passed: isDraftPassed,
      expected_count: draft.expected_findings.length,
      detected_count: res.findings.length,
      duration_ms: res.duration_ms,
      findings: res.findings.map((f) => ({
        category: f.category,
        severity: f.severity,
        span_text: f.span_text,
        source_id: f.source_id,
        suggested_fix: f.suggested_fix,
      })),
    });

    console.log(
      `   ${isDraftPassed ? '✅' : '❌'} [${draft.id}] (${draft.channel}) - Detected ${
        res.findings.length
      }/${draft.expected_findings.length} findings (${res.duration_ms}ms)`
    );
  }

  const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 1;
  const recall = totalExpected > 0 ? truePositives / totalExpected : 1;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const summary = {
    evaluated_at: new Date().toISOString(),
    total_drafts: drafts.length,
    flawed_drafts: drafts.filter((d) => !d.is_clean).length,
    clean_drafts: drafts.filter((d) => d.is_clean).length,
    metrics: {
      total_expected_violations: totalExpected,
      true_positives: truePositives,
      false_positives: falsePositives,
      false_negatives: falseNegatives,
      precision: Number((precision * 100).toFixed(1)),
      recall: Number((recall * 100).toFixed(1)),
      f1_score: Number((f1 * 100).toFixed(1)),
    },
    drafts: testResults,
  };

  const resultsPath = path.resolve(process.cwd(), 'seed/results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));

  console.log('\n=============================================================');
  console.log('📊 BrandSure Compliance Engine Benchmark Results:');
  console.log('=============================================================');
  console.log(` - Total Drafts Evaluated : ${drafts.length}`);
  console.log(` - True Positives         : ${truePositives} / ${totalExpected}`);
  console.log(` - False Positives        : ${falsePositives}`);
  console.log(` - False Negatives       : ${falseNegatives}`);
  console.log(` - Precision              : ${(precision * 100).toFixed(1)}%`);
  console.log(` - Recall                 : ${(recall * 100).toFixed(1)}%`);
  console.log(` - F1 Score               : ${(f1 * 100).toFixed(1)}%`);
  console.log('=============================================================');
  console.log(`📁 Detailed results saved to: ${resultsPath}\n`);
}

runBenchmark().catch((err) => {
  console.error('❌ Benchmark error:', err);
  process.exit(1);
});
