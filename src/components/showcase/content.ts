export interface PipelineLeg {
  id: string;
  number: string;
  title: string;
  tagline: string;
  metric: string;
  metricLabel: string;
  mechanism: string;
  description: string;
  sourcesCited: string[];
}

export interface CampaignFinding {
  span: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  ruleRef: string;
  fix: string;
  sourceType: 'fact' | 'guideline' | 'glossary';
}

export interface CampaignDraft {
  id: string;
  title: string;
  channel: string;
  targetAudience: string;
  originalText: string;
  reviewedText: string;
  score: number;
  status: 'Flagged' | 'Approved' | 'Requires Human Override';
  findings: CampaignFinding[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  stage: 'Active in Round 2' | 'Planned Next' | 'Future Roadmap';
  description: string;
  capabilities: string[];
}

export const SHOWCASE_CONTENT = {
  brand: {
    name: 'BrandSure',
    client: 'PayNest (Fictional Fintech Brand)',
    tagline: 'Pre-Publication Brand Governance for Fintech Marketing',
    hackathon: 'CodeNexus India 2026 — Round 2 Working Build',
    principle: 'Humans decide. AI only flags and suggests. Never invent a rule or fact.',
    benchmarkTruth: '12-draft sanity check on drafts written with the rulebook; larger benchmark planned',
  },

  hero: {
    eyebrow: 'PRE-PUBLICATION BRAND GOVERNANCE FOR FINTECH',
    title: 'BRANDSURE',
    subtitle: 'Where marketing creativity meets bounded compliance truth.',
    lead: 'Checks marketing text drafts strictly against approved guidelines, verified facts, and preferred terminology before publication.',
    scrollPrompt: 'SCROLL TO EXPLORE THE GOVERNANCE PIPELINE',
    riskClaims: [
      { id: '1', text: '100% Guaranteed Returns!', tag: 'Prohibited Superlative' },
      { id: '2', text: 'Zero Risk Wealth Growth', tag: 'Misleading Claim' },
      { id: '3', text: 'Instant Approval in 5s', tag: 'Unsubstantiated Fact' },
      { id: '4', text: 'Best Payment App in India', tag: 'Unsubstantiated Claim' },
      { id: '5', text: 'Crush All Bank Deposits', tag: 'Disparaging Comparison' },
      { id: '6', text: 'Unlimited Free Transfers', tag: 'Omitted Conditions' },
      { id: '7', text: 'Risk-Free Gold Savings', tag: 'Missing Risk Notice' },
      { id: '8', text: 'Guaranteed 15% APY', tag: 'Prohibited Yield Claim' },
    ],
  },

  pipeline: [
    {
      id: 'glossary',
      number: '01',
      title: 'Deterministic Terminology Engine',
      tagline: 'Exact Banned vs. Preferred Lexicon Matching',
      metric: 'Exact',
      metricLabel: 'Lookup Method',
      mechanism: 'Glossary Rule Enforcement',
      description: 'Scans text against approved brand terms. Flags strictly prohibited words (such as "guaranteed wealth" or "risk-free") and suggests preferred replacements.',
      sourcesCited: ['Glossary: preferred & prohibited brand terms', 'PayNest Brand Voice Standard']
    },
    {
      id: 'facts',
      number: '02',
      title: 'Structured Fact Base Validation',
      tagline: 'Substantiating Numeric Claims & Disclosures',
      metric: 'Key-Value',
      metricLabel: 'Relational Lookup',
      mechanism: 'PostgreSQL Fact Sheet Verification',
      description: 'Validates numbers, fees, and stated turnaround times directly against approved tabular fact sheets. If a number lacks supporting proof, it is flagged as unverified.',
      sourcesCited: ['Facts: Tariff-2026', 'Facts: KYC-SLA-2026', 'Facts: Product-Limits']
    },
    {
      id: 'rag',
      number: '03',
      title: 'Hybrid RAG Guideline Retrieval',
      tagline: 'Vector Similarity + Keyword Text Search',
      metric: 'Hybrid',
      metricLabel: 'Search Method',
      mechanism: 'pgvector Cosine + Postgres FTS Ranking',
      description: 'Finds relevant approved brand guidelines using dense semantic embeddings alongside keyword matching, surfacing exact excerpts for human verification.',
      sourcesCited: ['Guideline: GL-FIN-01 (Promotional Standards)', 'Guideline: GL-DISC-02 (Risk Notices)']
    },
    {
      id: 'bounded-judge',
      number: '04',
      title: 'Bounded Review & Suggestion Agent',
      tagline: 'Grounded Suggestions Without Human Disintermediation',
      metric: 'Bounded',
      metricLabel: 'Constraint Mode',
      mechanism: 'Evidence-Constrained Prompting',
      description: 'Flags specific text spans and suggests edits that preserve original marketing intent while adhering strictly to cited rules. The agent cannot approve, reject, or publish drafts.',
      sourcesCited: ['Cited Rulebook Sources Only', 'Human-in-the-Loop Decision Step']
    }
  ] as PipelineLeg[],

  campaignReel: [
    {
      id: 'camp-01',
      title: 'UPI Rewards Notification',
      channel: 'Push Notification · Social Ad',
      targetAudience: 'Active transacting users',
      originalText: 'Get guaranteed 12% instant cashback on every single UPI scan! Open an account in under 30 seconds.',
      reviewedText: 'Earn up to 12% rewards on eligible UPI merchant payments. Open an account in 2 minutes. T&C apply.',
      score: 68,
      status: 'Flagged',
      findings: [
        {
          span: 'guaranteed 12% instant cashback',
          issue: 'Prohibited superlative; cashback is tier-variable and subject to merchant conditions.',
          severity: 'high',
          ruleRef: 'GL-FIN-01 (PayNest Promotional Standards)',
          fix: 'Earn up to 12% rewards on eligible UPI merchant payments',
          sourceType: 'guideline'
        },
        {
          span: 'in under 30 seconds',
          issue: 'Turnaround fact mismatch: approved KYC turnaround minimum is 2 minutes.',
          severity: 'medium',
          ruleRef: 'Fact: KYC-SLA-2026',
          fix: 'Open an account in 2 minutes',
          sourceType: 'fact'
        }
      ]
    },
    {
      id: 'camp-02',
      title: 'WealthNest Multi-Asset Ad',
      channel: 'Search Ad · Social Banner',
      targetAudience: 'Retail investors',
      originalText: 'Invest with PayNest for guaranteed returns that crush traditional fixed deposits with zero risk.',
      reviewedText: 'Invest in curated portfolios designed to outperform traditional savings products. Investments are subject to market risks.',
      score: 42,
      status: 'Flagged',
      findings: [
        {
          span: 'guaranteed returns that crush traditional fixed deposits',
          issue: 'Prohibited return guarantee on market-linked securities.',
          severity: 'high',
          ruleRef: 'GL-INV-04 (PayNest Investment Promotion Code)',
          fix: 'Invest in curated portfolios designed to outperform traditional savings products',
          sourceType: 'guideline'
        },
        {
          span: 'zero risk',
          issue: 'Misrepresentation of capital safety; market risks must be explicitly disclosed.',
          severity: 'high',
          ruleRef: 'GL-DISC-02 (Mandatory Risk Disclaimer)',
          fix: 'Investments are subject to market risks. Read all scheme documents carefully.',
          sourceType: 'guideline'
        }
      ]
    },
    {
      id: 'camp-03',
      title: 'Cross-Border Travel Promo',
      channel: 'In-App Story · Email Blast',
      targetAudience: 'International travelers',
      originalText: 'Pay via PayNest UPI and enjoy unlimited free cross-border transactions all weekend.',
      reviewedText: 'Pay via PayNest UPI and enjoy 0% markup on select cross-border merchant transactions this weekend. Limits apply.',
      score: 74,
      status: 'Flagged',
      findings: [
        {
          span: 'unlimited free cross-border transactions',
          issue: 'Fact violation: Cross-border transactions are subject to daily limits and merchant eligibility.',
          severity: 'high',
          ruleRef: 'Fact: Tariff-2026 (Cross-Border Limits)',
          fix: '0% markup on select cross-border merchant transactions',
          sourceType: 'fact'
        }
      ]
    },
    {
      id: 'camp-04',
      title: 'Annual Compliance Summary',
      channel: 'Investor Update · Press Release',
      targetAudience: 'Stakeholders & partners',
      originalText: 'PayNest Financial Technologies operates under verified partner banking infrastructure with strict adherence to approved regulatory guidelines.',
      reviewedText: 'PayNest Financial Technologies operates under verified partner banking infrastructure with strict adherence to approved regulatory guidelines.',
      score: 100,
      status: 'Approved',
      findings: []
    }
  ] as CampaignDraft[],

  roadmap: [
    {
      id: 'current',
      title: 'Core Governance Engine',
      stage: 'Active in Round 2',
      description: 'The foundation built and verified in Round 2 of CodeNexus India 2026.',
      capabilities: [
        'Deterministic glossary & prohibited claims scanner',
        'Relational fact sheet validation for numeric claims',
        'Hybrid RAG (pgvector cosine + full-text search)',
        'Bounded review agent with exact rule citations',
        'Full four-role workflow (creator, reviewer, manager, admin)',
        'Append-only audit log recording every important action'
      ]
    },
    {
      id: 'multimodal',
      title: 'Creative & Image Verification',
      stage: 'Planned Next',
      description: 'Extending brand governance from text copy to visual marketing creatives.',
      capabilities: [
        'OCR extraction for social media graphics and banners',
        'Brand color palette & logo placement compliance check',
        'Mandatory statutory disclaimer legibility verification',
        'Automated Figma plugin integration'
      ]
    },
    {
      id: 'analytics',
      title: 'Governance Intelligence',
      stage: 'Future Roadmap',
      description: 'Organizational visibility into compliance bottlenecks and recurring risk patterns.',
      capabilities: [
        'Team-level violation trend analytics and risk scorecards',
        'Automated guideline update impact simulator',
        'Multi-brand governance workspace support',
        'Automated regulatory circular delta ingestion'
      ]
    }
  ] as RoadmapItem[],

  telemetry: {
    ruleCount: 48,
    benchmarkDrafts: 12,
    testedFindings: 14,
    truePositives: 14,
    benchmarkNote: '12-draft sanity check on drafts written with the rulebook; larger benchmark planned'
  }
};
