'use client';

import React, { useEffect, useRef, useState } from 'react';
import { scrollManager } from './scroll';
import { clamp } from './math';
import { SHOWCASE_CONTENT } from './content';
import { Cpu, Database, Search, FileCheck2 } from 'lucide-react';

const LEG_ICONS = [Cpu, Database, Search, FileCheck2];

export const GovernancePipeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);

  const [activeLegIndex, setActiveLegIndex] = useState(0);

  useEffect(() => {
    const unsub = scrollManager.subscribe(() => {
      if (!containerRef.current || !pathRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalH = containerRef.current.offsetHeight - window.innerHeight;
      const progress = clamp(-rect.top / Math.max(1, totalH));

      // Path length and drawing
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
      setActiveLegIndex((prev) => (prev !== legIdx ? legIdx : prev));

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
                      fontFamily="monospace"
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
            {SHOWCASE_CONTENT.pipeline.map((leg, index) => {
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
          <div>TRAVERSING: STAGE {SHOWCASE_CONTENT.pipeline[activeLegIndex].number} OF 04</div>
          <div className="text-earth">ENGINE STATUS: ZERO INVENTED RULES</div>
        </div>
      </div>
    </section>
  );
};
