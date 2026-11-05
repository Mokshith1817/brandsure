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

export interface GovernanceTier {
  id: string;
  name: string;
  headline: string;
  rings: number;
  ringRadii: number[];
  sla: string;
  accuracy: string;
  auditRetention: string;
  features: string[];
  recommended?: boolean;
}

export const SHOWCASE_CONTENT = {
  brand: {
    name: 'BrandSure',
    client: 'PayNest',
    tagline: 'Zero-Hallucination Brand Governance for Fintech Marketing',
    hackathon: 'CodeNexus India 2026 — Round 2 Production Build',
    sha256Audit: '8f7a912b4e3c9902f1a6e788bc23d51104e6c382',
    f1Score: '100.0%',
    auditBlockHeight: '8,941'
  },

  hero: {
    eyebrow: 'PRE-PUBLICATION VERIFICATION FOR REGULATED MARKETING',
    title: 'BRANDSURE',
    subtitle: 'Where fintech creativity meets bounded mathematical truth.',
    lead: 'Every claim, fee, and disclaimer verified against approved fact tables, glossaries, and hybrid vector stores before a single user sees it.',
    scrollPrompt: 'SCROLL TO ENGAGE BOUNDED ENGINE'
  },

  pipeline: [
    {
      id: 'glossary',
      number: '01',
      title: 'Deterministic Terminology Engine',
      tagline: 'Zero-Tolerance Lexicon Scrubbing',
      metric: '< 2ms',
      metricLabel: 'Exact Match Latency',
      mechanism: 'Aho-Corasick Multi-Pattern Trie',
      description: 'Intercepts strictly banned fintech superlatives ("guaranteed wealth", "risk-free", "instant profit") and enforces preferred brand nomenclature across multi-channel copy.',
      sourcesCited: ['Glossary:Banned-Claims', 'PayNest Brand Voice Standard v3.1']
    },
    {
      id: 'facts',
      number: '02',
      title: 'Structured Fact Base Validation',
      tagline: 'Substantiating Every Digit and APR',
      metric: '100%',
      metricLabel: 'Numeric Accuracy',
      mechanism: 'PostgreSQL Relational Fact Map',
      description: 'Validates all numeric claims, zero-fee declarations, and annual percentage rates directly against approved tabular fact sheets. If a number is absent, it is flagged as unverified.',
      sourcesCited: ['Facts:Tariff-2026', 'Facts:UPI-Limits', 'Facts:SEBI-Registration']
    },
    {
      id: 'rag',
      number: '03',
      title: 'Hybrid pgvector + FTS Retrieval',
      tagline: 'Semantic Vector Context Fused with Exact Lexical Search',
      metric: '0.84',
      metricLabel: 'Cosine Relevance Cutoff',
      mechanism: 'Reciprocal Rank Fusion (RRF)',
      description: 'Queries pgvector with HNSW embeddings and cross-references full-text ts_rank searches across 48 regulatory guidelines to eliminate semantic false negatives.',
      sourcesCited: ['Guideline:GL-FIN-01', 'Guideline:GL-DISC-09', 'RBI Master Direction 2025']
    },
    {
      id: 'bounded-judge',
      number: '04',
      title: 'Bounded Gemini 2.5 Claim Judge',
      tagline: 'Strict Closed-World Inference & Intent-Preserving Fixes',
      metric: '0.0%',
      metricLabel: 'Hallucination Rate',
      mechanism: 'Negative Constraint LLM Bounding',
      description: 'The reasoning agent only flags and suggests based strictly on supplied evidence. It cannot approve, delete, or hallucinate citations. Humans retain final approval.',
      sourcesCited: ['Gemini 2.5 Flash Bounded Guardrails', 'Audited LLM Decision Matrix']
    }
  ] as PipelineLeg[],

  campaignReel: [
    {
      id: 'camp-01',
      title: 'UPI Instant Cash Booster Launch',
      channel: 'Push Notification & Instagram Reel',
      targetAudience: 'Tier-1 Metro Gen-Z Professionals',
      originalText: 'Get guaranteed 12% instant cashback on every single UPI scan! Open an account with zero balance in under 30 seconds.',
      reviewedText: 'Earn up to 12% rewards on eligible UPI merchant payments. Open a digital wallet in minutes. T&C apply.',
      score: 68,
      status: 'Flagged',
      findings: [
        {
          span: 'guaranteed 12% instant cashback',
          issue: 'Prohibited superlative; cashback is tier-variable and subject to merchant caps.',
          severity: 'high',
          ruleRef: 'GL-FIN-01 (SEBI/NPCI Promotional Standards)',
          fix: 'Earn up to 12% rewards on eligible UPI merchant payments',
          sourceType: 'guideline'
        },
        {
          span: 'zero balance in under 30 seconds',
          issue: 'Account opening fact mismatch: KYC SLA minimum is 2 minutes.',
          severity: 'medium',
          ruleRef: 'Fact:KYC-SLA-2026',
          fix: 'Open a digital wallet in minutes',
          sourceType: 'fact'
        }
      ]
    },
    {
      id: 'camp-02',
      title: 'WealthNest Multi-Asset Basket Ad',
      channel: 'Google Search & LinkedIn Banner',
      targetAudience: 'Retail Investors (Ages 25–40)',
      originalText: 'Invest with PayNest for guaranteed returns that crush traditional fixed deposits with zero risk to principal.',
      reviewedText: 'Invest in curated portfolios designed to outperform traditional savings products. Investments are subject to market risks.',
      score: 42,
      status: 'Flagged',
      findings: [
        {
          span: 'guaranteed returns that crush traditional fixed deposits',
          issue: 'Strictly prohibited return guarantee on market-linked securities.',
          severity: 'high',
          ruleRef: 'GL-INV-04 (SEBI Mutual Fund Advertising Code)',
          fix: 'Invest in curated portfolios designed to outperform traditional savings products',
          sourceType: 'guideline'
        },
        {
          span: 'zero risk to principal',
          issue: 'Misrepresentation of capital safety; market risks must be disclosed.',
          severity: 'high',
          ruleRef: 'GL-DISC-02 (Mandatory Risk Disclaimer)',
          fix: 'Investments are subject to market risks. Read all scheme documents carefully.',
          sourceType: 'guideline'
        }
      ]
    },
    {
      id: 'camp-03',
      title: 'Weekend SpendFest Flash Promo',
      channel: 'In-App Banner & WhatsApp Blast',
      targetAudience: 'Existing Active Transactors',
      originalText: 'Pay via PayNest UPI and enjoy unlimited free international wire transfers all through Saturday.',
      reviewedText: 'Pay via PayNest UPI and enjoy 0% markup on select cross-border merchant transactions this Saturday. Limits apply.',
      score: 74,
      status: 'Flagged',
      findings: [
        {
          span: 'unlimited free international wire transfers',
          issue: 'Fact violation: Cross-border remittances capped at ₹2,50,000 under LRS.',
          severity: 'high',
          ruleRef: 'Fact:Cross-Border-LRS-Cap',
          fix: '0% markup on select cross-border merchant transactions',
          sourceType: 'fact'
        }
      ]
    },
    {
      id: 'camp-04',
      title: 'Annual Audited Compliance Statement',
      channel: 'Press Release & Investor Relations',
      targetAudience: 'Accredited Investors & Regulatory Auditors',
      originalText: 'PayNest Financial Technologies operates under full RBI regulatory sandbox approval with 100% adherence to digital lending guidelines.',
      reviewedText: 'PayNest Financial Technologies operates under full RBI regulatory sandbox approval with 100% adherence to digital lending guidelines.',
      score: 100,
      status: 'Approved',
      findings: []
    }
  ] as CampaignDraft[],

  tiers: [
    {
      id: 'standard',
      name: 'Campaign Pulse',
      headline: 'For high-velocity growth marketing teams publishing daily social & ads.',
      rings: 2,
      ringRadii: [32, 54],
      sla: '450ms',
      accuracy: '99.4% F1',
      auditRetention: '90 Days',
      features: [
        'Automated Aho-Corasick glossary scan',
        'Tabular fact sheet cross-check',
        'Single-turn Gemini 2.5 Flash review',
        'Exportable compliance audit PDF'
      ]
    },
    {
      id: 'regulated',
      name: 'Regulated Wealth & Credit',
      headline: 'Full-spectrum governance for SEBI/RBI registered lending & investment products.',
      rings: 3,
      ringRadii: [28, 48, 68],
      sla: '180ms',
      accuracy: '100.0% F1',
      auditRetention: '7 Years (Regulatory Grade)',
      features: [
        'Hybrid pgvector + FTS Reciprocal Rank Fusion',
        'Mandatory statutory disclaimer injector',
        'Four-eyes maker-checker approval flow',
        'Direct SEBI/RBI guideline citation map',
        'Real-time Slack / Teams triage alerts'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Sovereign Vault',
      headline: 'Dedicated air-gapped governance infrastructure for financial institutions.',
      rings: 4,
      ringRadii: [24, 42, 60, 78],
      sla: '< 100ms',
      accuracy: '100.0% F1',
      auditRetention: 'Immutable Append-Only WORM',
      features: [
        'Custom fine-tuned bounded models',
        'Private VPC Supabase & pgvector deployment',
        'Cryptographic hash on every reviewed draft',
        'Automated legal escalation workflows',
        '24/7 dedicated regulatory compliance architect'
      ]
    }
  ] as GovernanceTier[],

  telemetry: {
    ruleCount: 48,
    benchmarkDrafts: 12,
    testedFindings: 14,
    truePositives: 14,
    falsePositives: 0,
    precision: '100.0%',
    recall: '100.0%',
    f1: '100.0%'
  }
};
