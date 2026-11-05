const fs = require('fs');
const path = require('path');

const rulebookPath = path.resolve(__dirname, '../seed/rulebook.json');
const draftsPath = path.resolve(__dirname, '../seed/test_drafts.json');

const rulebook = JSON.parse(fs.readFileSync(rulebookPath, 'utf8'));
const drafts = JSON.parse(fs.readFileSync(draftsPath, 'utf8'));

console.log('--- BrandSure Phase 0 Verification ---');
console.log('Rulebook Facts:', rulebook.facts.length);
console.log('Rulebook Guidelines:', rulebook.guidelines.length);
console.log('Rulebook Glossary entries:', rulebook.glossary.length);
console.log('Total Test Drafts:', drafts.length);

const factKeys = new Set(rulebook.facts.map((f) => f.key));
const guidelineIds = new Set(rulebook.guidelines.map((g) => g.id));
const glossaryKeys = new Set(rulebook.glossary.map((g) => 'glossary:' + g.preferred));

let errors = 0;
let totalFindings = 0;

drafts.forEach((d) => {
  totalFindings += d.expected_findings.length;
  if (!d.is_clean && d.expected_findings.length === 0) {
    console.error(`[FAIL] Draft ${d.id}: Marked is_clean: false but has 0 expected findings.`);
    errors++;
  }
  if (d.is_clean && d.expected_findings.length > 0) {
    console.error(`[FAIL] Draft ${d.id}: Marked is_clean: true but contains ${d.expected_findings.length} findings.`);
    errors++;
  }

  d.expected_findings.forEach((f) => {
    // Check span exists in text
    if (!d.text.includes(f.span_text)) {
      console.error(`[FAIL] Draft ${d.id}: span_text "${f.span_text}" not found in text: "${d.text}"`);
      errors++;
    }
    // Check rule_ref resolves
    if (!factKeys.has(f.rule_ref) && !guidelineIds.has(f.rule_ref) && !glossaryKeys.has(f.rule_ref)) {
      console.error(`[FAIL] Draft ${d.id}: Unresolved rule_ref: "${f.rule_ref}"`);
      errors++;
    }
  });
});

if (errors === 0) {
  console.log(`\nSUCCESS: All 12 drafts and ${totalFindings} expected findings validate cleanly!`);
  console.log('Every rule_ref resolves to an approved fact, guideline, or glossary item.');
} else {
  console.error(`\nFAILED: Found ${errors} validation errors.`);
  process.exit(1);
}
