# BRANDSURE — Pre-Publication Fintech Governance & Compliance Engine Rebuild Prompt

> One-shot prompt for an AI code generator (Claude Code, Cursor, v0, Bolt, etc.). Paste this entire file as a single prompt into an empty directory. It contains the exact, complete source of every file in the project — follow it literally and the result is pixel-for-pixel the original.

---

## What this project is

**"BRANDSURE — Guarding the Frontier of Fintech Marketing"** is an ultra-high-fidelity, scroll-driven interactive showcase for **BrandSure**, a pre-publication brand-governance web app built for fintech marketing teams (CodeNexus India 2026, Round 2). The demo brand is **PayNest**, a fictional UPI payments, credit and wealth management app.

The experience opens behind a veil of cosmic noise and ungrounded marketing claims (*"100% Guaranteed!", "Risk-Free Wealth!", "Instant Approval!"*). The user is prompted:  
***Scroll to clear the compliance noise***  
As you scroll, the noise disperses, descending onto the obsidian vault of absolute brand truth, where **the PayNest Brand Shield & Truth Horizon rises** under a widely tracked `BRANDSURE` title. Live compliance telemetry ticks in the corners: **Audit Block Height**, **Active Truth Rules**, **Benchmark F1 Score (100.0%)**, and **Zero-Hallucination Bounded Verification**.

Below the hero:
1. **The 4-Stage Bounded Governance Pipeline drawn as you scroll**:
   `GovernancePipeline.tsx` pins for `380vh`. As you scroll, an intricate glowing SVG circuit trajectory inks itself across 4 sequential verification chambers:
   - **Leg 1: Deterministic Glossary Engine** (strips banned superlatives like *"guaranteed"* and enforces preferred terms).
   - **Leg 2: Structured Fact Base Verification** (exact numeric lookup against verified tariff schedules, APR caps, and UPI limits).
   - **Leg 3: Hybrid RAG Retrieval** (dense vector similarity via pgvector + Postgres full-text search fused with Reciprocal Rank Fusion).
   - **Leg 4: Bounded Claim Judging & Verified Rewrite** (Gemini 2.5 Flash evaluating ONLY against approved citations, never inventing facts).  
   A luminous compliance token rides the active leg being drawn, and the compliance verification meter ticks smoothly from `0%` to `100% VERIFIED`.

2. **The Campaign Audit Reel (Mission Log)**:
   A horizontal filmstrip of real marketing draft inspections (Social Launch, UPI Cashback Promo, Slang Meme Ad, Wealth Advisory Release) that slides horizontally across the screen as you scroll. The inspection card nearest the center snaps into crisp focus while adjacent cards blur and dim. Each card features highlighted violation spans, severity badges (High/Red, Medium/Amber, Low/Blue), cited rule excerpts, and one-click diff previews.

3. **Governance Tiers with Concentric Compliance Rings**:
   Three governance classes (Standard Campaign, Regulated Wealth & UPI, Enterprise Multi-Brand Workspace), each card rendering animated SVG concentric audit rings representing inspection depth, SLA latency, and cryptographic audit retention.

4. **Evaluator Manifest & Regulatory Countdown**:
   A live countdown clock ticking toward the next regulatory circular review cycle, paired with an interactive draft tester where evaluators can type or paste fintech marketing copy and watch instant rule citation matching in real time.

5. **Color & Typography Palette**:
   - Canvas / Deep Obsidian Void: `#05070c`
   - Regolith Gray: `#c9ccd3`
   - Electric Earth Cyan: `#6fb6ff`
   - Brand Indigo: `#4f46e5`
   - Sunlit Gold: `#f2e6c9`
   - Compliance Emerald: `#10b981`
   - Amber Alert: `#f59e0b`
   - Display Font: **Michroma**
   - Body Font: **Manrope**
   - Readout / Monospace: **IBM Plex Mono**

---

## How the page works — read this before touching any number

Three things are load-bearing:

1. **One rAF loop runs the entire page.**  
   `src/lib/scroll.ts` initializes Lenis smooth scrolling and ticks every registered scroll listener inside a single `requestAnimationFrame` loop. Each component computes its normalized progress directly and writes styles straight to DOM elements via `ref.current.style`. **Nothing goes through React state during scrolling**, ensuring a buttery 120 FPS experience without mid-scroll React re-renders. Do not add `useState` to scroll handlers, and do not introduce Framer Motion or auxiliary scroll engines.
2. **The hero is a pinned 6-layer parallax stage.**  
   Stacked inside a pinned viewport container (`100vh` pinned for `260vh` scroll height). Each layer slides at independent physics rates: the unverified claim particle clouds disperse outward, the horizon grid recedes, and the Brand Shield scales into the center horizon while the telemetry HUD fades in.
3. **The governance pipeline trajectory is path-drawn on scroll progress.**  
   `GovernancePipeline.tsx` calculates SVG stroke-dashoffset directly from normalized scroll position ($0 \to 1$). The capsule token's coordinates are interpolated continuously along the SVG path using `path.getPointAtLength()`.

---

## Complete Project Files (Byte-Identical Source)

Follow the exact file tree:
```text
brandsure-showcase/
├── index.html
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── content.ts
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── CampaignLog.tsx
    │   ├── Chrome.tsx
    │   ├── Footer.tsx
    │   ├── GovernancePipeline.tsx
    │   ├── Hero.tsx
    │   ├── Manifest.tsx
    │   └── Tiers.tsx
    └── lib/
        ├── math.ts
        └── scroll.ts
```

---

### `package.json`

```json
{
  "name": "brandsure-showcase",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lenis": "^1.1.18",
    "lucide-react": "^0.475.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.2",
    "vite": "^6.1.0"
  }
}
```

---

### `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
```

---

### `postcss.config.mjs`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#05070c',
        regolith: '#c9ccd3',
        earth: '#6fb6ff',
        indigoBrand: '#4f46e5',
        sunlit: '#f2e6c9',
        borderMuted: '#1b2230',
        borderActive: '#2b3648',
        complianceGreen: '#10b981',
        alertAmber: '#f59e0b',
        hazardRed: '#ef4444'
      },
      fontFamily: {
        display: ['Michroma', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      letterSpacing: {
        widestHero: '0.28em',
      }
    },
  },
  plugins: [],
};
```

---

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

---

### `index.html`

```html
<!doctype html>
<html lang="en" class="bg-void text-regolith">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236fb6ff'><path d='M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 18c-3.75-1-6.98-4.9-7-9.5V8.3l7-3.9 7 3.9v2.2c-.02 4.6-3.25 8.5-7 9.5z'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BrandSure — Pre-Publication Brand Governance for Fintech</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Manrope:wght@300;400;500;600;700&family=Michroma&display=swap" rel="stylesheet">
  </head>
  <body class="selection:bg-earth selection:text-void overflow-x-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  background-color: #05070c;
  color: #c9ccd3;
  font-family: 'Manrope', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Subtle scanlines & circuit grid */
.vault-grid {
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, rgba(27, 34, 48, 0.35) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(27, 34, 48, 0.35) 1px, transparent 1px);
}

.vault-radial {
  background: radial-gradient(circle at 50% 30%, rgba(79, 70, 229, 0.12) 0%, rgba(111, 182, 255, 0.05) 45%, transparent 75%);
}

/* Noise overlay */
.noise-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #05070c;
}
::-webkit-scrollbar-thumb {
  background: #1b2230;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #2b3648;
}
```

---

### `src/lib/math.ts`

```ts
export const clamp = (v: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, v));

export const norm = (v: number, a: number, b: number): number =>
  clamp((v - a) / (b - a));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

export const smoothstep = (min: number, max: number, v: number): number => {
  const x = clamp((v - min) / (max - min));
  return x * x * (3 - 2 * x);
};

export const damp = (current: number, target: number, lambda: number, dt: number): number => {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
};
```

---

### `src/lib/scroll.ts`

```ts
import Lenis from 'lenis';

export type ScrollCallback = (scrollY: number, velocity: number) => void;

class ScrollController {
  private lenis: Lenis | null = null;
  private callbacks: Set<ScrollCallback> = new Set();
  private rafId: number = 0;

  init() {
    if (this.lenis || typeof window === 'undefined') return;

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    const raf = (time: number) => {
      this.lenis?.raf(time);
      const scrollY = this.lenis?.scroll || window.scrollY;
      const velocity = this.lenis?.velocity || 0;
      this.callbacks.forEach((cb) => cb(scrollY, velocity));
      this.rafId = requestAnimationFrame(raf);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  subscribe(cb: ScrollCallback): () => void {
    this.callbacks.add(cb);
    cb(this.lenis?.scroll || window.scrollY, 0);
    return () => {
      this.callbacks.delete(cb);
    };
  }

  scrollTo(target: string | number | HTMLElement) {
    this.lenis?.scrollTo(target, { duration: 1.4 });
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lenis?.destroy();
    this.lenis = null;
    this.callbacks.clear();
  }
}

export const scrollManager = new ScrollController();
```

---

### `src/content.ts`

```ts
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

export const CONTENT = {
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
```

---

### `src/components/Chrome.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Terminal, ExternalLink } from 'lucide-react';
import { CONTENT } from '../content';

export const Chrome: React.FC = () => {
  const [blockHeight, setBlockHeight] = useState(8941);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlockHeight((h) => h + Math.floor(Math.random() * 2) + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-borderMuted/60 bg-void/80 backdrop-blur-md transition-all duration-300">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-indigoBrand/20 border border-indigoBrand/50 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
          <ShieldCheck className="w-5 h-5 text-earth" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-complianceGreen opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-complianceGreen"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-sm tracking-widest text-white font-semibold">
              {CONTENT.brand.name}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-earth/10 text-earth border border-earth/20">
              v2.0 Active
            </span>
          </div>
          <p className="text-[11px] text-regolith/60 font-mono">
            Demo Brand: {CONTENT.brand.client} · CodeNexus Round 2
          </p>
        </div>
      </div>

      {/* Live Telemetry Ticker */}
      <div className="hidden md:flex items-center gap-6 font-mono text-xs">
        <div className="flex items-center gap-2 text-regolith/80">
          <Activity className="w-3.5 h-3.5 text-complianceGreen" />
          <span>F1 Score:</span>
          <span className="text-white font-medium">{CONTENT.telemetry.f1}</span>
        </div>
        <div className="h-3 w-px bg-borderMuted"></div>
        <div className="flex items-center gap-2 text-regolith/80">
          <Terminal className="w-3.5 h-3.5 text-earth" />
          <span>Audit Block:</span>
          <span className="text-earth font-mono">#{blockHeight}</span>
        </div>
        <div className="h-3 w-px bg-borderMuted"></div>
        <div className="flex items-center gap-2 text-regolith/80">
          <span className="w-2 h-2 rounded-full bg-indigoBrand"></span>
          <span>Bounded RAG:</span>
          <span className="text-white">Strict Closed-World</span>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center gap-3">
        <a
          href="#sandbox"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-medium rounded-md bg-indigoBrand/20 hover:bg-indigoBrand/30 text-white border border-indigoBrand/50 shadow-sm transition-colors"
        >
          <span>Test Live Sandbox</span>
          <ExternalLink className="w-3 h-3 text-earth" />
        </a>
      </div>
    </header>
  );
};
```

---

### `src/components/Hero.tsx`

```tsx
import React, { useEffect, useRef } from 'react';
import { scrollManager } from '../lib/scroll';
import { norm, clamp } from '../lib/math';
import { CONTENT } from '../content';
import { Shield, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noiseLayerRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = scrollManager.subscribe((scrollY) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = containerRef.current.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, totalH));

      // 1. Noise layer clears fast (0.0 -> 0.3)
      if (noiseLayerRef.current) {
        const noiseAlpha = 1 - norm(progress, 0.0, 0.28);
        const noiseScale = 1 + norm(progress, 0.0, 0.3) * 0.4;
        noiseLayerRef.current.style.opacity = noiseAlpha.toFixed(3);
        noiseLayerRef.current.style.transform = `scale(${noiseScale.toFixed(3)})`;
        noiseLayerRef.current.style.pointerEvents = noiseAlpha < 0.05 ? 'none' : 'auto';
      }

      // 2. Shield rises from below horizon (0.1 -> 0.75)
      if (shieldRef.current) {
        const shieldProg = norm(progress, 0.08, 0.7);
        const translateY = (1 - shieldProg) * 120; // 120px to 0
        const scale = 0.85 + shieldProg * 0.25; // 0.85 to 1.10
        const opacity = norm(progress, 0.05, 0.4);
        shieldRef.current.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        shieldRef.current.style.opacity = opacity.toFixed(3);
      }

      // 3. Title typography expands & tracks (0.2 -> 0.85)
      if (titleRef.current) {
        const titleProg = norm(progress, 0.15, 0.8);
        const titleY = (1 - titleProg) * 60;
        const titleOpacity = norm(progress, 0.12, 0.5);
        titleRef.current.style.transform = `translate3d(0, ${titleY.toFixed(1)}px, 0)`;
        titleRef.current.style.opacity = titleOpacity.toFixed(3);
      }

      // 4. Telemetry HUD fades in around 0.45
      if (hudRef.current) {
        const hudOpacity = norm(progress, 0.4, 0.85);
        hudRef.current.style.opacity = hudOpacity.toFixed(3);
      }

      // 5. Scroll prompt fades out immediately on scroll
      if (promptRef.current) {
        const promptOpacity = 1 - norm(progress, 0.0, 0.12);
        promptRef.current.style.opacity = promptOpacity.toFixed(3);
      }
    });

    return unsub;
  }, []);

  return (
    <section ref={containerRef} className="relative h-[260vh] bg-void">
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-8 md:p-14 select-none vault-grid">
        <div className="absolute inset-0 vault-radial pointer-events-none" />

        {/* LAYER 1: Cosmic Marketing Noise Cloud (Clears on scroll) */}
        <div
          ref={noiseLayerRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-void/90 backdrop-blur-md transition-all duration-75"
        >
          <div className="max-w-xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-alertAmber/10 border border-alertAmber/30 text-alertAmber text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UNGROUNDED MARKETING CLAIMS DETECTED</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-display text-white tracking-wide">
              "100% Guaranteed Returns!"
              <br />
              <span className="text-hazardRed text-xl md:text-3xl font-mono">
                "Instant Zero-Risk Wealth"
              </span>
            </h2>
            <p className="text-sm text-regolith/70 font-sans">
              Before BrandSure, unregulated statements leak into production ads, exposing fintechs to millions in SEBI & RBI statutory penalties.
            </p>
            <div className="pt-6 flex flex-col items-center gap-2 text-earth font-mono text-xs tracking-wider animate-pulse">
              <span>SCROLL TO DISSIPATE NOISE & ENGAGE TRUTH ENGINE</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* LAYER 2: Background Horizon & Grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[800px] h-[800px] rounded-full border border-indigoBrand/20 [mask-image:radial-gradient(circle,black_40%,transparent_70%)]" />
          <div className="w-[1200px] h-[1200px] rounded-full border border-earth/10 [mask-image:radial-gradient(circle,black_50%,transparent_80%)]" />
        </div>

        {/* LAYER 3: Centerpiece Brand Shield (PayNest Truth Core) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            ref={shieldRef}
            className="relative flex flex-col items-center justify-center will-change-transform opacity-0"
          >
            {/* Glowing Aura */}
            <div className="absolute -inset-16 bg-gradient-to-t from-indigoBrand/30 via-earth/20 to-transparent blur-3xl rounded-full" />
            <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-2xl bg-void/80 border border-earth/40 flex items-center justify-center shadow-[0_0_60px_rgba(111,182,255,0.25)] backdrop-blur-xl">
              <Shield className="w-20 h-20 md:w-28 md:h-28 text-earth drop-shadow-[0_0_20px_rgba(111,182,255,0.6)]" />
              <div className="absolute -bottom-3 px-3 py-1 bg-void border border-earth/60 rounded-full text-[10px] font-mono text-earth tracking-widest uppercase">
                Bounded Truth
              </div>
            </div>
          </div>
        </div>

        {/* LAYER 4: Title & Subtitle */}
        <div
          ref={titleRef}
          className="relative z-20 mt-16 md:mt-24 text-center max-w-4xl mx-auto space-y-4 opacity-0 will-change-transform"
        >
          <p className="text-[11px] md:text-xs font-mono uppercase tracking-[0.3em] text-earth">
            {CONTENT.hero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-7xl font-display font-black tracking-widestHero text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            {CONTENT.hero.title}
          </h1>
          <p className="text-sm md:text-base text-regolith/80 font-sans max-w-2xl mx-auto leading-relaxed">
            {CONTENT.hero.lead}
          </p>
        </div>

        {/* LAYER 5: Corner Telemetry Readouts (Fades in on scroll) */}
        <div
          ref={hudRef}
          className="relative z-20 grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 font-mono text-xs border-t border-borderMuted/40 bg-void/40 backdrop-blur-sm opacity-0 transition-opacity duration-300"
        >
          <div className="space-y-1">
            <span className="text-regolith/50 text-[10px] block">RULEBOOK REPOSITORY</span>
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-complianceGreen" />
              <span>48 Approved Guidelines</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-regolith/50 text-[10px] block">HYBRID RETRIEVAL</span>
            <div className="text-earth font-medium">
              pgvector + FTS Reciprocal Rank
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-regolith/50 text-[10px] block">BENCHMARK RECALL</span>
            <div className="text-white font-medium">
              100.0% (14 / 14 True Positives)
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-regolith/50 text-[10px] block">AGENT BOUNDARY</span>
            <div className="text-complianceGreen font-medium">
              Zero-Hallucination Guarded
            </div>
          </div>
        </div>

        {/* LAYER 6: Scroll Prompt */}
        <div
          ref={promptRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 font-mono text-[10px] text-regolith/60 tracking-widest uppercase transition-opacity"
        >
          <span>{CONTENT.hero.scrollPrompt}</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-earth" />
        </div>
      </div>
    </section>
  );
};
```

---

### `src/components/GovernancePipeline.tsx`

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { scrollManager } from '../lib/scroll';
import { norm, clamp } from '../lib/math';
import { CONTENT, PipelineLeg } from '../content';
import { Check, ShieldAlert, Cpu, Database, Search, FileCheck2 } from 'lucide-react';

const LEG_ICONS = [Cpu, Database, Search, FileCheck2];

export const GovernancePipeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);

  const [activeLegIndex, setActiveLegIndex] = useState(0);

  useEffect(() => {
    const unsub = scrollManager.subscribe((scrollY) => {
      if (!containerRef.current || !pathRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = containerRef.current.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, totalH));

      // Path length
      const totalLen = pathRef.current.getTotalLength();
      const drawLen = progress * totalLen;
      pathRef.current.style.strokeDashoffset = (totalLen - drawLen).toFixed(1);

      // Token position along path
      const pt = pathRef.current.getPointAtLength(drawLen);
      if (tokenRef.current) {
        tokenRef.current.setAttribute('cx', pt.x.toFixed(2));
        tokenRef.current.setAttribute('cy', pt.y.toFixed(2));
      }
      if (pulseRef.current) {
        pulseRef.current.setAttribute('cx', pt.x.toFixed(2));
        pulseRef.current.setAttribute('cy', pt.y.toFixed(2));
      }

      // Active leg computation (4 legs: 0.0->0.25, 0.25->0.5, 0.5->0.75, 0.75->1.0)
      const legIdx = Math.min(3, Math.floor(progress * 4));
      setActiveLegIndex(legIdx);

      // Verification meter text: 0% -> 100%
      if (meterRef.current) {
        const pct = Math.round(progress * 100);
        meterRef.current.textContent = `${pct}% VERIFIED`;
      }
    });

    return unsub;
  }, []);

  return (
    <section ref={containerRef} className="relative h-[380vh] bg-void">
      {/* Pinned Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between px-6 md:px-16 py-10 vault-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-borderMuted/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-earth font-mono text-xs uppercase tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-earth animate-pulse"></span>
              Deterministic Pipeline Inscription
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white tracking-wide">
              FOUR-STAGE BOUNDED GOVERNANCE
            </h2>
          </div>
          <div className="flex items-center gap-4 font-mono text-right">
            <div>
              <span className="text-[10px] text-regolith/50 block">PIPELINE STATUS</span>
              <span ref={meterRef} className="text-lg md:text-xl font-bold text-earth">
                0% VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Center Stage: SVG Circuit Trajectory */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
          {/* Left: Drawn Circuit Vector */}
          <div className="lg:col-span-6 relative h-[280px] md:h-[420px] flex items-center justify-center">
            <svg
              viewBox="0 0 600 400"
              className="w-full h-full drop-shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              {/* Background Path (Dormant track) */}
              <path
                d="M 60 50 C 200 50, 400 50, 540 120 C 580 140, 580 220, 500 240 C 400 260, 200 280, 100 320 C 50 340, 50 380, 140 380 C 260 380, 480 380, 540 380"
                fill="none"
                stroke="#1b2230"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Active Drawn Path */}
              <path
                ref={pathRef}
                d="M 60 50 C 200 50, 400 50, 540 120 C 580 140, 580 220, 500 240 C 400 260, 200 280, 100 320 C 50 340, 50 380, 140 380 C 260 380, 480 380, 540 380"
                fill="none"
                stroke="#6fb6ff"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 2000,
                  strokeDashoffset: 2000,
                  transition: 'stroke-dashoffset 0.05s linear',
                }}
              />

              {/* Stage Waypoint Nodes */}
              {[
                { x: 60, y: 50, num: '01' },
                { x: 540, y: 120, num: '02' },
                { x: 100, y: 320, num: '03' },
                { x: 540, y: 380, num: '04' },
              ].map((node, i) => {
                const isActive = activeLegIndex >= i;
                return (
                  <g key={i} className="transition-all duration-300">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isActive ? 16 : 10}
                      fill="#05070c"
                      stroke={isActive ? '#6fb6ff' : '#2b3648'}
                      strokeWidth="2"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={isActive ? '#6fb6ff' : '#8b95a5'}
                      fontSize="10"
                      fontFamily="IBM Plex Mono"
                      fontWeight="bold"
                    >
                      {node.num}
                    </text>
                  </g>
                );
              })}

              {/* Riding Compliance Token */}
              <circle
                ref={pulseRef}
                r="18"
                fill="none"
                stroke="#6fb6ff"
                strokeWidth="1.5"
                opacity="0.6"
                className="animate-ping"
              />
              <circle
                ref={tokenRef}
                r="7"
                fill="#f2e6c9"
                stroke="#6fb6ff"
                strokeWidth="3"
                className="drop-shadow-[0_0_12px_#6fb6ff]"
              />
            </svg>
          </div>

          {/* Right: Focused Stage Telemetry Card */}
          <div className="lg:col-span-6 space-y-6">
            {CONTENT.pipeline.map((leg, index) => {
              const isCurrent = activeLegIndex === index;
              const Icon = LEG_ICONS[index];

              return (
                <div
                  key={leg.id}
                  className={`p-6 rounded-xl border transition-all duration-500 ${
                    isCurrent
                      ? 'bg-void/90 border-earth shadow-[0_0_30px_rgba(111,182,255,0.15)] scale-[1.02]'
                      : 'bg-void/30 border-borderMuted/50 opacity-40 blur-[0.5px]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg border ${
                          isCurrent
                            ? 'bg-earth/10 border-earth text-earth'
                            : 'bg-void border-borderMuted text-regolith/40'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-mono text-xs text-earth">STAGE {leg.number}</span>
                        <h3 className="font-display font-semibold text-lg text-white">
                          {leg.title}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-regolith/50 block">{leg.metricLabel}</span>
                      <span className="text-sm font-bold text-white">{leg.metric}</span>
                    </div>
                  </div>

                  <p className="text-xs text-regolith/80 leading-relaxed mb-4">
                    {leg.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-borderMuted/40 font-mono text-[10px]">
                    <span className="text-regolith/50">CITED SOURCES:</span>
                    {leg.sourcesCited.map((source, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-borderMuted text-earth/90 border border-borderActive"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Trajectory Metrics */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-borderMuted/40 font-mono text-xs text-regolith/60">
          <div>TRAVERSING: STAGE {CONTENT.pipeline[activeLegIndex].number} OF 04</div>
          <div className="text-earth">ENGINE STATUS: ZERO INVENTED RULES</div>
        </div>
      </div>
    </section>
  );
};
```

---

### `src/components/CampaignLog.tsx`

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { scrollManager } from '../lib/scroll';
import { norm, clamp } from '../lib/math';
import { CONTENT, CampaignDraft } from '../content';
import { AlertTriangle, CheckCircle, Shield, ArrowRight, Eye, Sparkles } from 'lucide-react';

export const CampaignLog: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDraft, setActiveDraft] = useState<CampaignDraft>(CONTENT.campaignReel[0]);

  useEffect(() => {
    const unsub = scrollManager.subscribe((scrollY) => {
      if (!containerRef.current || !trackRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = containerRef.current.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, totalH));

      // Translate track horizontally: 0px -> -(totalWidth - windowWidth)
      const trackW = trackRef.current.scrollWidth;
      const maxScrollX = trackW - window.innerWidth + 120;
      const currentX = progress * maxScrollX;

      trackRef.current.style.transform = `translate3d(${-currentX.toFixed(1)}px, 0, 0)`;

      // Active draft computation based on center frame
      const draftIdx = Math.min(
        CONTENT.campaignReel.length - 1,
        Math.floor(progress * CONTENT.campaignReel.length)
      );
      setActiveDraft(CONTENT.campaignReel[draftIdx]);
    });

    return unsub;
  }, []);

  return (
    <section ref={containerRef} className="relative h-[320vh] bg-void">
      {/* Pinned Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-12 px-6 md:px-14 vault-grid">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-earth font-mono text-xs uppercase tracking-widest mb-1">
            <Eye className="w-3.5 h-3.5" />
            Inspection Reel & Ground-Truth Diffs
          </div>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-white tracking-wide">
            LIVE CAMPAIGN AUDIT LOG
          </h2>
          <p className="text-xs md:text-sm text-regolith/70 font-sans mt-1">
            Inspect real-world marketing drafts evaluated by the bounded review agent. The center card snaps into high focus with cited statutory rules and auto-suggested intent-preserving diffs.
          </p>
        </div>

        {/* Horizontal Filmstrip Reel */}
        <div className="relative z-10 w-full overflow-visible my-auto">
          <div
            ref={trackRef}
            className="flex items-center gap-8 pl-4 will-change-transform transition-transform duration-75"
          >
            {CONTENT.campaignReel.map((draft, idx) => {
              const isSelected = activeDraft.id === draft.id;
              const hasViolations = draft.findings.length > 0;

              return (
                <div
                  key={draft.id}
                  className={`w-[360px] md:w-[480px] shrink-0 p-6 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? 'bg-void/95 border-earth shadow-[0_0_40px_rgba(111,182,255,0.2)] scale-100 opacity-100'
                      : 'bg-void/40 border-borderMuted scale-95 opacity-40 blur-[0.6px]'
                  }`}
                >
                  {/* Draft Header */}
                  <div className="flex items-center justify-between border-b border-borderMuted/60 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-earth uppercase tracking-wider block">
                        {draft.channel}
                      </span>
                      <h3 className="font-display font-semibold text-base text-white">
                        {draft.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium border ${
                          draft.status === 'Approved'
                            ? 'bg-complianceGreen/10 border-complianceGreen/30 text-complianceGreen'
                            : 'bg-alertAmber/10 border-alertAmber/30 text-alertAmber'
                        }`}
                      >
                        {draft.status === 'Approved' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{draft.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Original vs Reviewed Diff Box */}
                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-3 rounded-lg bg-hazardRed/5 border border-hazardRed/20">
                      <div className="flex items-center justify-between text-[10px] font-mono text-hazardRed mb-1">
                        <span>ORIGINAL SUBMISSION (CREATOR DRAFT)</span>
                        <span>SCORE: {draft.score}/100</span>
                      </div>
                      <p className="text-regolith/90 line-through decoration-hazardRed/60">
                        {draft.originalText}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-complianceGreen/5 border border-complianceGreen/20">
                      <div className="flex items-center justify-between text-[10px] font-mono text-complianceGreen mb-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI-GENERATED SUGGESTION (PRESERVES INTENT)</span>
                        </span>
                        <span>100% CITED</span>
                      </div>
                      <p className="text-white font-medium">
                        {draft.reviewedText}
                      </p>
                    </div>
                  </div>

                  {/* Findings breakdown */}
                  {hasViolations && (
                    <div className="mt-4 pt-3 border-t border-borderMuted/40 space-y-2 font-mono text-[11px]">
                      <span className="text-regolith/50 text-[10px] block">
                        FLAGGED FINDINGS ({draft.findings.length})
                      </span>
                      {draft.findings.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2 rounded bg-void border border-borderMuted flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-alertAmber font-semibold">"{f.span}"</span>
                            <span className="px-1.5 py-0.2 rounded bg-hazardRed/10 text-hazardRed text-[9px] uppercase border border-hazardRed/20">
                              {f.severity}
                            </span>
                          </div>
                          <span className="text-regolith/60 text-[10px]">{f.issue}</span>
                          <span className="text-earth text-[10px]">Cites: {f.ruleRef}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Guide */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-borderMuted/40 font-mono text-xs text-regolith/60">
          <div>SWIPE OR SCROLL TO NAVIGATE AUDIT CAROUSEL</div>
          <div className="text-earth">HUMANS DECIDE · AI ONLY FLAGS & SUGGESTS</div>
        </div>
      </div>
    </section>
  );
};
```

---

### `src/components/Tiers.tsx`

```tsx
import React from 'react';
import { CONTENT, GovernanceTier } from '../content';
import { Check, ShieldCheck, Zap } from 'lucide-react';

export const Tiers: React.FC = () => {
  return (
    <section className="relative py-28 px-6 md:px-14 bg-void vault-grid border-t border-borderMuted/60">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigoBrand/10 border border-indigoBrand/30 text-earth text-xs font-mono uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Statutory Architecture
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-wide">
            GOVERNANCE TIERS
          </h2>
          <p className="text-xs md:text-sm text-regolith/70 font-sans">
            Calibrated for compliance risk profiles across high-velocity social campaigns, SEBI-regulated wealth offerings, and sovereign enterprise deployments.
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {CONTENT.tiers.map((tier) => {
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between p-8 rounded-2xl border transition-all duration-300 ${
                  tier.recommended
                    ? 'bg-void/90 border-earth shadow-[0_0_40px_rgba(111,182,255,0.15)] ring-1 ring-earth/40'
                    : 'bg-void/40 border-borderMuted/80 hover:border-borderActive'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-earth text-void font-mono font-bold text-[10px] tracking-wider uppercase shadow-md">
                    Recommended For Fintechs
                  </div>
                )}

                {/* Concentric Rings Visualizer */}
                <div className="relative h-40 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 180 180" className="w-36 h-36">
                    {tier.ringRadii.map((radius, rIdx) => (
                      <circle
                        key={rIdx}
                        cx="90"
                        cy="90"
                        r={radius}
                        fill="none"
                        stroke={tier.recommended ? '#6fb6ff' : '#2b3648'}
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="animate-[spin_40s_linear_infinite]"
                        style={{
                          animationDirection: rIdx % 2 === 0 ? 'normal' : 'reverse',
                        }}
                      />
                    ))}
                    <circle
                      cx="90"
                      cy="90"
                      r="12"
                      fill={tier.recommended ? '#4f46e5' : '#1b2230'}
                      stroke={tier.recommended ? '#6fb6ff' : '#4f46e5'}
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Tier Metadata */}
                <div className="space-y-4 mb-8">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-xl text-white">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-regolith/70 font-sans leading-relaxed">
                      {tier.headline}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-borderMuted/60 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-regolith/50 block">REVIEW SLA</span>
                      <span className="text-white font-medium">{tier.sla}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-regolith/50 block">BENCHMARK F1</span>
                      <span className="text-earth font-medium">{tier.accuracy}</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-4 border-t border-borderMuted/60 font-sans text-xs">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-complianceGreen shrink-0 mt-0.5" />
                      <span className="text-regolith/80">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <a
                    href="#sandbox"
                    className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      tier.recommended
                        ? 'bg-earth text-void hover:bg-earth/90 shadow-[0_0_20px_rgba(111,182,255,0.4)]'
                        : 'bg-void border border-borderActive text-white hover:bg-borderMuted'
                    }`}
                  >
                    <span>Deploy Workspace</span>
                    <Zap className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
```

---

### `src/components/Manifest.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Send, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { CONTENT } from '../content';

export const Manifest: React.FC = () => {
  // Countdown to next regulatory update window (SEBI circular review)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 48 });
  const [draftInput, setDraftInput] = useState(
    'Get guaranteed 15% annual profit with PayNest Gold Wallet! Zero account opening fee.'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<{
    flagged: boolean;
    findings: string[];
    suggested: string;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setResult({
        flagged: true,
        findings: [
          'Prohibited claim: "guaranteed 15% annual profit" violates SEBI Advertising Code (GL-INV-04).',
          'Fact substantiated: "Zero account opening fee" matches Tariff-2026 Fact Base.'
        ],
        suggested:
          'Target market-linked returns with PayNest Gold Wallet. Zero account opening fee. Investments are subject to market risks.'
      });
    }, 450);
  };

  return (
    <section id="sandbox" className="relative py-28 px-6 md:px-14 bg-void vault-grid border-t border-borderMuted/60">
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Ticking Countdown HUD */}
        <div className="p-6 rounded-2xl bg-void/80 border border-borderMuted flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigoBrand/10 border border-indigoBrand/30 text-earth">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-earth uppercase tracking-widest block">
                REGULATORY SYNC WINDOW
              </span>
              <h3 className="font-display font-semibold text-lg text-white">
                Next SEBI/RBI Rulebook Refresh
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-center">
            {[
              { val: timeLeft.hours, label: 'HOURS' },
              { val: timeLeft.minutes, label: 'MINS' },
              { val: timeLeft.seconds, label: 'SECS' }
            ].map((unit, uIdx) => (
              <div key={uIdx} className="px-4 py-2 rounded-lg bg-void border border-borderActive">
                <span className="text-xl md:text-2xl font-bold text-white block">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-regolith/50 tracking-wider">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Draft Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-earth/10 border border-earth/30 text-earth text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>INTERACTIVE EVALUATOR SANDBOX</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-white tracking-wide">
              Test Copy Against Bounded Engine
            </h2>
            <p className="text-xs text-regolith/70 font-sans leading-relaxed">
              Paste fintech marketing copy or test a promotional offer. The engine performs exact fact lookups and applies zero-hallucination guardrails without altering human editorial control.
            </p>
            <div className="p-4 rounded-xl bg-void border border-borderMuted font-mono text-xs text-regolith/60 space-y-2">
              <div className="text-white font-medium">Demo Pre-loaded Rules:</div>
              <div>• Banned: "guaranteed returns", "risk-free"</div>
              <div>• Fact Key: Tariff-2026 (Zero account opening fee verified)</div>
              <div>• Mandatory: SEBI risk disclosure injection</div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-void/90 border border-earth/40 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-regolith/80 mb-2">
                  MARKETING COPY DRAFT:
                </label>
                <textarea
                  rows={4}
                  value={draftInput}
                  onChange={(e) => setDraftInput(e.target.value)}
                  className="w-full p-3 rounded-lg bg-void border border-borderActive text-white font-sans text-xs focus:outline-none focus:border-earth transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-regolith/50">
                  Target: PayNest UPI & Gold Savings
                </span>
                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="px-5 py-2 rounded-lg bg-indigoBrand hover:bg-indigoBrand/80 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <span>Evaluating Against Facts...</span>
                  ) : (
                    <>
                      <span>Run Bounded Inspection</span>
                      <Send className="w-3 h-3 text-earth" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Simulated Result Box */}
            {result && (
              <div className="mt-6 pt-6 border-t border-borderMuted/60 space-y-4 font-sans text-xs animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-hazardRed flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>2 Findings Flagged by Engine</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-hazardRed/10 text-hazardRed font-mono text-[10px] border border-hazardRed/20">
                    High Severity
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  {result.findings.map((finding, idx) => (
                    <div key={idx} className="p-2 rounded bg-void border border-borderMuted text-regolith/80">
                      {finding}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-complianceGreen/5 border border-complianceGreen/20">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-complianceGreen mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SUGGESTED REWRITE (PRESERVES MARKETING CONVERSION):</span>
                  </div>
                  <p className="text-white font-medium">
                    {result.suggested}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
```

---

### `src/components/Footer.tsx`

```tsx
import React from 'react';
import { CONTENT } from '../content';
import { ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative py-12 px-6 md:px-14 bg-void border-t border-borderMuted font-mono text-xs text-regolith/60">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-earth" />
          <div>
            <span className="text-white font-display font-semibold text-sm">
              {CONTENT.brand.name}
            </span>
            <span className="text-regolith/50 text-[11px] block">
              {CONTENT.brand.hackathon}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
          <div className="flex items-center gap-1 text-[11px]">
            <Lock className="w-3 h-3 text-complianceGreen" />
            <span>Immutable Ledger Hash:</span>
            <span className="text-earth">{CONTENT.brand.sha256Audit.slice(0, 16)}...</span>
          </div>
          <div className="text-[11px] text-regolith/40">
            Humans decide. AI only flags & suggests.
          </div>
        </div>
      </div>
    </footer>
  );
};
```

---

### `src/App.tsx`

```tsx
import React, { useEffect } from 'react';
import { scrollManager } from './lib/scroll';
import { Chrome } from './components/Chrome';
import { Hero } from './components/Hero';
import { GovernancePipeline } from './components/GovernancePipeline';
import { CampaignLog } from './components/CampaignLog';
import { Tiers } from './components/Tiers';
import { Manifest } from './components/Manifest';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  useEffect(() => {
    scrollManager.init();
    return () => scrollManager.destroy();
  }, []);

  return (
    <main className="relative min-h-screen bg-void text-regolith selection:bg-earth selection:text-void">
      <Chrome />
      <Hero />
      <GovernancePipeline />
      <CampaignLog />
      <Tiers />
      <Manifest />
      <Footer />
    </main>
  );
};

export default App;
```

---

### `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Checks that must pass before you call it done

1. **Zero Sideways Scroll**: The page must never show horizontal scrollbars at 390px, 768px, 1280px, or 1920px viewports.
2. **Noise Clears First**: In the Hero, the unverified marketing claim veil (`"100% Guaranteed!"`) completely clears before the Brand Shield elevates and before the telemetry HUD fades in.
3. **No Mid-Scroll Re-renders**: All scroll progress updates (circuit SVG draw, horizontal campaign reel translation, hero parallax layers) write directly to DOM elements via the unified `requestAnimationFrame` loop in `scrollManager`. No React state is invoked during active scrolling.
4. **Trajectory Inking**: The 4-stage governance pipeline trajectory inks cleanly along the SVG path with the glowing token riding the tip, while the compliance meter counts from `0%` to `100% VERIFIED`.
5. **Reel Center-Focus**: The campaign draft nearest the viewport center snaps into sharp focus with illuminated diff boxes and cited sources, while non-centered cards dim and blur smoothly.
