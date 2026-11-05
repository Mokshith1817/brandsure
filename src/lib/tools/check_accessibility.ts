export interface FormattingFinding {
  category: 'formatting' | 'accessibility';
  severity: 'low';
  span_text: string;
  reason: string;
  source_type: 'guideline';
  source_id: 'guideline-formatting' | 'guideline-accessibility';
  source_excerpt: string;
  suggested_fix: string;
  start_index: number;
  end_index: number;
}

export function checkAccessibilityAndFormatting(text: string): FormattingFinding[] {
  const findings: FormattingFinding[] = [];

  // 1. Shouting check: Sequences of 3 or more uppercase words (excluding brand acronyms of 2 letters)
  const shoutingRegex = /\b[A-Z0-9]{2,}(?:\s+[A-Z0-9]{2,}){2,}\b/g;
  let match: RegExpExecArray | null;

  while ((match = shoutingRegex.exec(text)) !== null) {
    const spanText = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + spanText.length;

    // Convert to title case or lowercase for suggestion
    const fix = spanText
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    findings.push({
      category: 'formatting',
      severity: 'low',
      span_text: spanText,
      reason: 'Avoid all-caps shouting. Professional fintech communications require clean sentence casing.',
      source_type: 'guideline',
      source_id: 'guideline-formatting',
      source_excerpt:
        'Avoid deceptive formatting, excessive exclamation marks, and all-caps shouting in digital advertising headlines or social copy.',
      suggested_fix: fix,
      start_index: startIndex,
      end_index: endIndex,
    });
  }

  // 2. Excessive exclamation marks (2 or more)
  const exclamationRegex = /!{2,}/g;
  while ((match = exclamationRegex.exec(text)) !== null) {
    const spanText = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + spanText.length;

    findings.push({
      category: 'formatting',
      severity: 'low',
      span_text: spanText,
      reason: 'Excessive exclamation marks reduce brand credibility and may violate advertising standards.',
      source_type: 'guideline',
      source_id: 'guideline-formatting',
      source_excerpt: 'Avoid excessive exclamation marks in marketing and campaign copy.',
      suggested_fix: '.',
      start_index: startIndex,
      end_index: endIndex,
    });
  }

  return findings;
}
