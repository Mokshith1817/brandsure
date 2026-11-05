# BrandSure Seed & Evaluation Benchmark

This directory contains the foundational, fictional benchmark datasets for **BrandSure**, configured for the demo brand **PayNest** (a fictional UPI payments and investing app).

All data in these files is completely fictional and contains no confidential or real proprietary information.

---

## 1. Files in this Directory

* **`rulebook.json`**: The canonical brand and compliance rulebook for PayNest. It includes:
  * **5 Approved Facts**: Ground-truth numerical figures, fee policies, performance benchmarks, and operational metrics.
  * **6 Guidelines**: Core brand policies spanning `financial-promises`, `claims`, `tone`, `accessibility`, `terminology`, and `formatting`.
  * **10 Glossary Entries**: Preferred terms paired with explicit banned/restricted variations and contextual usage notes.
* **`test_drafts.json`**: 12 diverse test drafts across four channels (`social`, `email`, `ad`, `blog`).
  * **6 Flawed Drafts (`is_clean: false`)**: Contain 1 to 3 deliberate violations each (guaranteed returns, unsubstantiated superlatives, outdated metrics, banned words, inappropriate tone, and improper casing).
  * **6 Clean Drafts (`is_clean: true`)**: Fully compliant drafts, including true approved facts, to rigorously test against false positives.
  * Varying lengths: short social tweets, marketing ad copy, email notifications, and a full ~150-word blog paragraph.

---

## 2. Rulebook Schema & Structure

```json
{
  "facts": [
    {
      "key": "fact-upi-fee",
      "statement": "UPI payments on PayNest carry zero transaction fees for the user.",
      "value": "0",
      "unit": "INR",
      "as_of": "2026-10-01",
      "source_note": "Fictional demo data for PayNest (Pricing Policy v2)"
    }
  ],
  "guidelines": [
    {
      "id": "guideline-financial-promises",
      "title": "Prohibition of Guaranteed Returns and Assured Outcomes",
      "text": "Never promise, state, or imply guaranteed financial returns...",
      "category": "financial-promises"
    }
  ],
  "glossary": [
    {
      "preferred": "members",
      "banned": ["customers", "users", "clients"],
      "note": "Refer to people who use PayNest as members to reinforce community focus."
    }
  ]
}
```

---

## 3. Test Drafts & Reference Resolution Mapping

Every `rule_ref` in `test_drafts.json` resolves deterministically to a guideline `id`, fact `key`, or glossary `preferred` entry in `rulebook.json`:

| Draft ID | Channel | Text Span Flagged | Category | Resolves To (`rule_ref`) | Target Rule in `rulebook.json` |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`draft-01`** | Social | `"fastest in India"` | `claims` | `guideline-claims` | Guideline: Substantiation of Promotional and Superlative Claims |
| | Social | `"guaranteed to double your savings"` | `financial-promises` | `guideline-financial-promises` | Guideline: Prohibition of Guaranteed Returns and Assured Outcomes |
| **`draft-02`** | Ad | `"5 million"` | `claims` | `fact-user-count` | Fact: 1.2 million registered members as of 30 Sept 2026 |
| | Ad | `"customers"` | `terminology` | `glossary:members` | Glossary: Preferred "members", banned ["customers", "users", "clients"] |
| **`draft-03`** | Social | `"Oopsie! Bank servers went RIP lol"` | `tone` | `guideline-tone` | Guideline: Professional and Reassuring Brand Tone |
| | Social | `"Paynest"` | `terminology` | `glossary:PayNest` | Glossary: Preferred "PayNest", banned ["Paynest", "PN", "Pay Nest"] |
| **`draft-04`** | Email | `"risk-free fixed 12% yield"` | `financial-promises` | `guideline-financial-promises` | Guideline: Prohibition of Guaranteed Returns and Assured Outcomes |
| | Email | `"3x better than any traditional bank"` | `claims` | `guideline-claims` | Guideline: Substantiation of Promotional and Superlative Claims |
| **`draft-05`** | Blog | `"PN"` | `terminology` | `glossary:PayNest` | Glossary: Preferred "PayNest", banned ["Paynest", "PN", "Pay Nest"] |
| | Blog | `"10X FASTER THAN EVERY OTHER APP"` | `claims` | `guideline-claims` | Guideline: Substantiation of Claims (fact-app-speed states 2x vs v1.0) |
| | Blog | `"assured wealth growth with zero downside risk"` | `financial-promises` | `guideline-financial-promises` | Guideline: Prohibition of Guaranteed Returns and Assured Outcomes |
| **`draft-06`** | Ad | `"lightning cash"` | `terminology` | `glossary:instant transfer` | Glossary: Preferred "instant transfer", banned ["lightning cash"] |
| | Ad | `"India's No. 1 payment app"` | `claims` | `guideline-claims` | Guideline: Substantiation of Promotional and Superlative Claims |
| | Ad | `"money demand"` | `terminology` | `glossary:payment request` | Glossary: Preferred "payment request", banned ["money demand"] |
| **`draft-07`** | Social | *(None - Clean)* | N/A | N/A | Clean test case for zero UPI fees (`fact-upi-fee`) |
| **`draft-08`** | Ad | *(None - Clean)* | N/A | N/A | Clean test case for 1.2M user count (`fact-user-count`) |
| **`draft-09`** | Email | *(None - Clean)* | N/A | N/A | Clean test case for v2.3 2x speedup (`fact-app-speed`) |
| **`draft-10`** | Social | *(None - Clean)* | N/A | N/A | Clean test case for 24/7 support hours (`fact-support-hours`) |
| **`draft-11`** | Ad | *(None - Clean)* | N/A | N/A | Clean test case for 140+ supported banks (`fact-supported-banks`) |
| **`draft-12`** | Blog | *(None - Clean)* | N/A | N/A | Clean test case for full-length financial education blog |

---

## 4. Verification

Run the verification script to validate JSON formatting and check that every `rule_ref` correctly resolves:

```bash
node -e "
const fs = require('fs');
const rulebook = JSON.parse(fs.readFileSync('./seed/rulebook.json', 'utf8'));
const drafts = JSON.parse(fs.readFileSync('./seed/test_drafts.json', 'utf8'));

const factKeys = new Set(rulebook.facts.map(f => f.key));
const guidelineIds = new Set(rulebook.guidelines.map(g => g.id));
const glossaryKeys = new Set(rulebook.glossary.map(g => 'glossary:' + g.preferred));

let valid = true;
drafts.forEach(d => {
  d.expected_findings.forEach(f => {
    if (!factKeys.has(f.rule_ref) && !guidelineIds.has(f.rule_ref) && !glossaryKeys.has(f.rule_ref)) {
      console.error('Unresolved rule_ref in draft ' + d.id + ': ' + f.rule_ref);
      valid = false;
    }
  });
});
if (valid) console.log('All 12 drafts and ' + drafts.reduce((acc, d) => acc + d.expected_findings.length, 0) + ' expected findings resolve successfully!');
"
```
