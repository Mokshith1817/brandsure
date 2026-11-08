export interface Project {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  category: string;
  timeline: string;
  status: "live" | "shipped" | "featured" | "concept";
  stack: string[];
  summary: string;
  client?: string;
  accent: string;
  bg: string;
  fg: string;
  badge: string;
  metrics: { label: string; value: string }[];
  description: string;
  challenges: string[];
  liveUrl?: string;
  githubUrl?: string;
  posterSeed: number;
  posterImage?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "01",
    slug: "neuralforge-engine",
    title: "NEURALFORGE ENGINE",
    kicker: "SYSTEMS & WEBGPU — PRODUCTION",
    category: "Graphics Engine",
    timeline: "JAN 2026 — PRESENT",
    status: "featured",
    stack: ["Rust", "WebGPU", "TypeScript", "Wasm", "WGSL"],
    summary:
      "A distributed real-time rendering and compute substrate designed for sovereign agentic workloads. Features sub-millisecond shader compilation and deterministic state synchronisation across client clusters.",
    client: "Autonomous Research Lab",
    accent: "#ED1C24",
    bg: "#10192A",
    fg: "#F3EFE5",
    badge: "01 / 12",
    metrics: [
      { label: "Frame Budget", value: "< 8.2ms" },
      { label: "Throughput", value: "4.8M ops/s" },
      { label: "Wasm Footprint", value: "412 KB" },
    ],
    description:
      "NeuralForge combines compute shaders with WebGPU rasterisation to render complex spatial graphs and multi-agent simulation fields directly in browser tabs without remote streaming artifacts.",
    challenges: [
      "Zero-copy memory mapping between Rust WebAssembly linear memory and GPU buffers.",
      "Custom spatial partition tree for 50,000+ interactive entities at 120 FPS.",
      "Hardware-accelerated perceptual hashing for real-time visual regression testing.",
    ],
    liveUrl: "https://neuralforge.dev",
    githubUrl: "https://github.com/mokshith/neuralforge-engine",
    posterSeed: 104,
  },
  {
    id: "02",
    slug: "protocol-synapse",
    title: "PROTOCOL SYNAPSE",
    kicker: "AGENTIC INFRASTRUCTURE — ACTIVE",
    category: "P2P Agent Mesh",
    timeline: "NOV 2025 — JAN 2026",
    status: "live",
    stack: ["Go", "Libp2p", "gRPC", "Next.js", "eBPF"],
    summary:
      "Zero-trust peer-to-peer transport protocol allowing autonomous LLM agents to negotiate tool execution capabilities, exchange cryptographic attestations, and settle micro-tokens.",
    client: "Decentralized Systems Foundation",
    accent: "#F59E0B",
    bg: "#18201E",
    fg: "#F4F0E8",
    badge: "02 / 12",
    metrics: [
      { label: "Peer Latency", value: "14ms p99" },
      { label: "Active Nodes", value: "12,400+" },
      { label: "Verification", value: "Cryptographic" },
    ],
    description:
      "Engineered from RFC specification to production rollout. Synapse provides an encrypted session layer over UDP/QUIC with deterministic failover and state consensus across unreliable edge nodes.",
    challenges: [
      "NAT hole-punching reliability across enterprise symetric firewalls.",
      "Lightweight ed25519 payload signing integrated with session handshakes.",
    ],
    liveUrl: "https://synapse.protocol.io",
    githubUrl: "https://github.com/mokshith/protocol-synapse",
    posterSeed: 219,
  },
  {
    id: "03",
    slug: "axiom-terminal",
    title: "AXIOM TERMINAL",
    kicker: "FINANCIAL OS — SHIPPED",
    category: "High-Frequency Dashboard",
    timeline: "AUG 2025 — NOV 2025",
    status: "shipped",
    stack: ["React", "WebGL", "Rust", "WebSockets", "Canvas"],
    summary:
      "High-density algorithmic market surveillance interface processing over 120,000 order book updates per second with zero UI frame drops and microsecond tick visualization.",
    client: "Quant Vanguard Capital",
    accent: "#10B981",
    bg: "#0B1519",
    fg: "#E5ECE9",
    badge: "03 / 12",
    metrics: [
      { label: "Event Ingest", value: "120k/sec" },
      { label: "UI Jitter", value: "< 0.4ms" },
      { label: "Memory Stable", value: "48h continuous" },
    ],
    description:
      "Bypassed standard DOM rendering bottlenecks by writing a dedicated 2D WebGL instanced quad renderer for order books, heatmaps, and continuous depth ladders.",
    challenges: [
      "Preventing garbage collection pauses during sudden liquidity bursts.",
      "Off-screen canvas thread worker synchronization via SharedArrayBuffer.",
    ],
    liveUrl: "https://axiomterminal.app",
    githubUrl: "https://github.com/mokshith/axiom-terminal",
    posterSeed: 341,
  },
  {
    id: "04",
    slug: "chronos-compiler",
    title: "CHRONOS COMPILER",
    kicker: "DEV TOOLS — OPEN SOURCE",
    category: "Static Analysis",
    timeline: "MAY 2025 — AUG 2025",
    status: "live",
    stack: ["Rust", "LLVM", "Tree-Sitter", "TypeScript"],
    summary:
      "A fast incremental time-travel compiler for distributed TypeScript services. Generates deterministically verifiable snapshot diffs to replay production bug traces locally.",
    client: "Open Source Initiative",
    accent: "#6366F1",
    bg: "#17152B",
    fg: "#F2EFF7",
    badge: "04 / 12",
    metrics: [
      { label: "Build Speed", value: "32x vs tsc" },
      { label: "Trace Depth", value: "Infinite replay" },
      { label: "Stars", value: "4.2k" },
    ],
    description:
      "Chronos instruments AST nodes at compile time to inject deterministic causal clocks into async promise chains, rendering nondeterministic race conditions obsolete.",
    challenges: [
      "Preserving full source map fidelity across aggressive multi-pass optimizations.",
      "Minimal runtime instrumentation overhead (< 2.4%).",
    ],
    liveUrl: "https://chronos-lang.dev",
    githubUrl: "https://github.com/mokshith/chronos-compiler",
    posterSeed: 492,
  },
  {
    id: "05",
    slug: "hyperion-cad",
    title: "HYPERION CAD",
    kicker: "CREATIVE TECH — PRODUCTION",
    category: "Procedural 3D Modeler",
    timeline: "FEB 2025 — MAY 2025",
    status: "featured",
    stack: ["Three.js", "GLSL", "React", "Tailwind CSS", "C++"],
    summary:
      "Parametric procedural mechanical design environment in the web browser. Generates production-ready STEP and STL CAD assets using signed distance functions (SDF).",
    client: "Aerospace Component Systems",
    accent: "#EC4899",
    bg: "#24141E",
    fg: "#F8EBF2",
    badge: "05 / 12",
    metrics: [
      { label: "Boolean Time", value: "Realtime 60fps" },
      { label: "Export Formats", value: "STEP, IGES, STL" },
      { label: "CSG Engine", value: "Dual Marching Cubes" },
    ],
    description:
      "Combines real-time raymarching shaders for viewport feedback with dual-contouring meshing workers that produce manifold geometry for CNC milling and 3D printing.",
    challenges: [
      "Exact continuous curvature continuity (G2 fillets) in implicit math representations.",
      "WebAssembly SIMD parallelization of volumetric grids.",
    ],
    liveUrl: "https://hyperioncad.io",
    githubUrl: "https://github.com/mokshith/hyperion-cad",
    posterSeed: 588,
  },
  {
    id: "06",
    slug: "veritas-db",
    title: "VERITAS STORE",
    kicker: "DATABASE SYSTEMS — EXPERIMENTAL",
    category: "Append-Only Storage",
    timeline: "NOV 2024 — FEB 2025",
    status: "shipped",
    stack: ["Zig", "LSM-Tree", "io_uring", "Raft", "Python"],
    summary:
      "An append-only cryptographically verifiable key-value database built for audit logs and machine learning checkpoint lineages. Verified with formal TLA+ specifications.",
    client: "Security & Sovereign Identity Group",
    accent: "#06B6D4",
    bg: "#0F1F24",
    fg: "#E8F5F7",
    badge: "06 / 12",
    metrics: [
      { label: "Write IOPS", value: "480k / sec" },
      { label: "Merkle Check", value: "< 2ms" },
      { label: "Data Integrity", value: "100% Cryptographic" },
    ],
    description:
      "Uses modern Linux io_uring asynchronous system calls in Zig to saturate NVMe drive bandwidth while maintaining an ongoing sparse Merkle tree state root.",
    challenges: [
      "Zero lock contention on concurrent compaction runs.",
      "Deterministic crash-recovery testing using fault injection fuzzers.",
    ],
    liveUrl: "https://veritasdb.tech",
    githubUrl: "https://github.com/mokshith/veritas-db",
    posterSeed: 673,
  },
  {
    id: "07",
    slug: "strata-ui",
    title: "STRATA DESIGN SYSTEM",
    kicker: "DESIGN ENGINEERING — SHIPPED",
    category: "Component Substrate",
    timeline: "AUG 2024 — OCT 2024",
    status: "shipped",
    stack: ["TypeScript", "CSS Architecture", "Figma API", "Radix"],
    summary:
      "An architectural design token and typography framework inspired by mid-century Swiss graphic design, International Typographic Style, and modern accessible Web standards.",
    client: "Design Engineering Guild",
    accent: "#D8EF72",
    bg: "#1D2313",
    fg: "#F5F8ED",
    badge: "07 / 12",
    metrics: [
      { label: "Accessibility", value: "WCAG AAA 100%" },
      { label: "Bundle Size", value: "14 KB gzip" },
      { label: "Adoption", value: "18 Product Teams" },
    ],
    description:
      "Constructed around optical size variable fonts, tactile physics-based transitions, tabular data alignments, and fluid responsive modular scales.",
    challenges: [
      "Strict contrast compliance across dark and paper-cream backgrounds.",
      "Zero runtime CSS-in-JS dependencies using pure CSS variables and utility classes.",
    ],
    liveUrl: "https://strata-ui.design",
    githubUrl: "https://github.com/mokshith/strata-ui",
    posterSeed: 782,
  },
  {
    id: "08",
    slug: "orbit-telemetry",
    title: "ORBIT TELEMETRY",
    kicker: "CLOUD & KUBERNETES — PRODUCTION",
    category: "Observability Platform",
    timeline: "MAY 2024 — JUL 2024",
    status: "live",
    stack: ["Rust", "ClickHouse", "OpenTelemetry", "Next.js"],
    summary:
      "Real-time distributed tracing and topology explorer mapping dependencies across 3,000+ microservices with anomaly detection and automated root-cause attribution.",
    client: "Enterprise Infrastructure Cloud",
    accent: "#F97316",
    bg: "#241A12",
    fg: "#FAF1EA",
    badge: "08 / 12",
    metrics: [
      { label: "Query Speed", value: "18ms across 2TB" },
      { label: "Ingest Rate", value: "1.2M spans/sec" },
      { label: "Storage Reduction", value: "84% ZSTD" },
    ],
    description:
      "Features dynamic canvas-based dependency graph rendering with physics-based layout stabilization, temporal timeline scrubbers, and live flamegraphs.",
    challenges: [
      "Streaming aggregation of high-cardinality trace identifiers without out-of-memory errors.",
      "Responsive force-directed graph visualization for 5,000 nodes.",
    ],
    liveUrl: "https://orbittelemetry.io",
    githubUrl: "https://github.com/mokshith/orbit-telemetry",
    posterSeed: 855,
  },
  {
    id: "09",
    slug: "pulse-audio",
    title: "PULSE AUDIO CORE",
    kicker: "CREATIVE CODING — SHIPPED",
    category: "Web Audio Synthesizer",
    timeline: "FEB 2024 — APR 2024",
    status: "shipped",
    stack: ["AudioWorklet", "Wasm", "C++", "Canvas 2D", "DSP"],
    summary:
      "A modular polyphonic additive synthesizer and spectral visualizer executing in an isolated AudioWorklet thread with sample-accurate parameter modulation.",
    client: "Sound & Interaction Studio",
    accent: "#38BDF8",
    bg: "#0E1C28",
    fg: "#E7F4FA",
    badge: "09 / 12",
    metrics: [
      { label: "Audio Latency", value: "< 2.9ms" },
      { label: "Voices", value: "32 Polyphonic" },
      { label: "Glitch-Free", value: "100% Core-isolated" },
    ],
    description:
      "Implements bandlimited oscillator tables, zero-delay feedback state variable filters, and an animated phosphor-oscilloscope rendering via 60fps canvas blits.",
    challenges: [
      "Lock-free ringbuffer messaging between the main UI thread and the audio rendering process.",
      "WebAssembly compilation of legacy DSP filters with zero allocations.",
    ],
    liveUrl: "https://pulseaudio.studio",
    githubUrl: "https://github.com/mokshith/pulse-audio",
    posterSeed: 912,
  },
  {
    id: "10",
    slug: "cortex-copilot",
    title: "CORTEX RUNTIME",
    kicker: "MACHINE LEARNING — ACTIVE",
    category: "Local LLM Inference",
    timeline: "OCT 2023 — JAN 2024",
    status: "featured",
    stack: ["WebGPU", "ONNX Runtime", "Transformers.js", "TypeScript"],
    summary:
      "In-browser localized multi-modal embedding generation and semantic vector search running 100% on device client GPU with absolute data confidentiality.",
    client: "Privacy First Technologies",
    accent: "#A855F7",
    bg: "#1D1328",
    fg: "#F6EEFA",
    badge: "10 / 12",
    metrics: [
      { label: "Model Size", value: "Q4_K Quantized" },
      { label: "Inference Speed", value: "48 tokens/sec" },
      { label: "Network Egress", value: "0 Bytes (Offline)" },
    ],
    description:
      "Runs state-of-the-art vision and language models directly inside the client browser tab using quantized shader passes, enabling privacy-sensitive document analysis.",
    challenges: [
      "Optimized FP16 matrix multiplication kernels for Apple Silicon and Nvidia WebGPU drivers.",
      "Progressive streaming model weights caching via the Origin Private File System (OPFS).",
    ],
    liveUrl: "https://cortexruntime.com",
    githubUrl: "https://github.com/mokshith/cortex-copilot",
    posterSeed: 1045,
  },
  {
    id: "11",
    slug: "beacon-identity",
    title: "BEACON PASS",
    kicker: "CRYPTOGRAPHY — SHIPPED",
    category: "Zero-Knowledge Auth",
    timeline: "JUN 2023 — SEP 2023",
    status: "shipped",
    stack: ["Circom", "SnarkJS", "WebAuthn", "TypeScript"],
    summary:
      "Biometric passkey authentication protocol that proves user attributes (e.g., country of residence, age threshold, accreditation) without revealing underlying identity.",
    client: "Global Credential Consortium",
    accent: "#E11D48",
    bg: "#261017",
    fg: "#FAEBEE",
    badge: "11 / 12",
    metrics: [
      { label: "Proof Generation", value: "420ms on Mobile" },
      { label: "Circuit Constraints", value: "14,800" },
      { label: "Verification Time", value: "3ms" },
    ],
    description:
      "Couples FIDO2 WebAuthn hardware secure enclaves with Groth16 zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs).",
    challenges: [
      "Optimized multi-scalar multiplication (MSM) algorithms running in parallel web workers.",
      "Cross-platform biometric signature verification without browser extensions.",
    ],
    liveUrl: "https://beaconpass.id",
    githubUrl: "https://github.com/mokshith/beacon-identity",
    posterSeed: 1184,
  },
  {
    id: "12",
    slug: "zenith-sim",
    title: "ZENITH AEROSPACE",
    kicker: "PHYSICS ENGINE — EXPERIMENTAL",
    category: "Orbital Mechanics Simulator",
    timeline: "JAN 2023 — MAY 2023",
    status: "live",
    stack: ["Three.js", "Web Workers", "Wasm", "Rust"],
    summary:
      "Relativistic N-body orbital dynamics simulator visualizing Lagrange points, perturbation anomalies, and satellite constellations in high-precision symplectic coordinates.",
    client: "Orbital Navigation Lab",
    accent: "#F43F5E",
    bg: "#151B2E",
    fg: "#F0F4FC",
    badge: "12 / 12",
    metrics: [
      { label: "Body Count", value: "10,000 bodies" },
      { label: "Integrator", value: "4th Order Yoshida" },
      { label: "Precision", value: "Float64 Symplectic" },
    ],
    description:
      "An educational and scientific telemetry visualizer modeling gravitation harmonics (J2, J3, J4) and solar radiation pressure on multi-satellite orbital planes.",
    challenges: [
      "Eliminating floating point drift across millions of simulation timesteps.",
      "Seamless visual transitions from low-Earth orbit (LEO) to deep interplanetary trajectories.",
    ],
    liveUrl: "https://zenithaerospace.org",
    githubUrl: "https://github.com/mokshith/zenith-sim",
    posterSeed: 1290,
  },
];
