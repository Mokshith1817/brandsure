'use client';

import React, { useEffect, useRef } from 'react';
import { onFrame } from './scroll';
import { pinProgress } from './math';
import { SHOWCASE_CONTENT } from './content';
import { Cpu, Database, Search, FileCheck2 } from 'lucide-react';

const LEG_ICONS = [Cpu, Database, Search, FileCheck2];

// Path coordinates: A clean circuit trajectory across 4 distinct waypoints
const SVG_PATH_D = 'M 60 50 C 220 50, 380 50, 540 120 C 580 140, 560 220, 480 240 C 360 270, 180 290, 100 320 C 50 340, 70 380, 160 380 C 280 380, 460 380, 540 380';

// Waypoint fractions where legs start (0.00, 0.25, 0.50, 0.75)
const STAGE_WAYPOINTS = [
  { fraction: 0.00, num: '01' },
  { fraction: 0.25, num: '02' },
  { fraction: 0.50, num: '03' },
  { fraction: 0.75, num: '04' },
];

export const GovernancePipeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<SVGCircleElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const stageCardsRef = useRef<HTMLDivElement[]>([]);
  const waypointNodesRef = useRef<SVGGElement[]>([]);

  useEffect(() => {
    let last = -1;
    let currentIdx = -1;
    let cachedTotalLength = 0;

    if (pathRef.current) {
      cachedTotalLength = pathRef.current.getTotalLength();
      // Initialize node coordinates to match exact fractions of the path (R7)
      STAGE_WAYPOINTS.forEach((wp, i) => {
        const pt = pathRef.current!.getPointAtLength(cachedTotalLength * wp.fraction);
        const nodeG = waypointNodesRef.current[i];
        if (nodeG) {
          const circle = nodeG.querySelector('circle');
          const text = nodeG.querySelector('text');
          if (circle) {
            circle.setAttribute('cx', String(pt.x));
            circle.setAttribute('cy', String(pt.y));
          }
          if (text) {
            text.setAttribute('x', String(pt.x));
            text.setAttribute('y', String(pt.y + 4));
          }
        }
      });
    }

    return onFrame(() => {
      const root = containerRef.current;
      if (!root || !pathRef.current) return;

      const { p, rect, vh } = pinProgress(root);

      // Off-screen guard & unchanged guard (R6)
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - last) < 0.0005) return;
      last = p;

      // Draw active path using pathLength={1} (R7)
      pathRef.current.style.strokeDashoffset = String(1 - p);

      // Move token along path (R7)
      if (tokenRef.current && cachedTotalLength > 0) {
        const pt = pathRef.current.getPointAtLength(cachedTotalLength * p);
        tokenRef.current.setAttribute('cx', String(pt.x.toFixed(1)));
        tokenRef.current.setAttribute('cy', String(pt.y.toFixed(1)));
      }

      // Percentage counter write (R2)
      if (meterRef.current) {
        const pct = Math.round(p * 100);
        meterRef.current.textContent = `${pct}% VERIFIED`;
      }

      // Discrete stage activation without React state (R2, R7)
      const legIdx = Math.min(3, Math.floor(p * 4));
      if (legIdx !== currentIdx) {
        currentIdx = legIdx;
        stageCardsRef.current.forEach((card, idx) => {
          if (card) {
            card.dataset.active = String(idx === legIdx);
          }
        });
        waypointNodesRef.current.forEach((node, idx) => {
          if (node) {
            node.dataset.active = String(idx <= legIdx);
            const circle = node.querySelector('circle');
            if (circle) {
              circle.setAttribute('stroke', idx <= legIdx ? '#6fb6ff' : '#2b3648');
              circle.setAttribute('r', idx === legIdx ? '14' : '10');
            }
          }
        });
      }
    });
  }, []);

  return (
    <section ref={containerRef} className="relative h-[300svh] bg-void">
      {/* Pinned Stage Container (100svh - R8) */}
      <div className="sticky top-0 h-screen-s w-full overflow-hidden flex flex-col justify-between px-6 md:px-14 py-8 vault-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-borderMuted/60 pb-4">
          <div>
            <div className="flex items-center gap-2 text-earth font-mono text-xs uppercase tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-earth animate-pulse"></span>
              Deterministic Governance Pipeline
            </div>
            <h2 className="text-xl md:text-3xl font-display text-white tracking-wide font-normal">
              FOUR-STAGE BOUNDED CHECKS
            </h2>
          </div>
          <div className="font-mono text-right">
            <span className="text-[10px] text-regolith/50 block uppercase">Traversed</span>
            <span ref={meterRef} className="text-lg md:text-xl font-bold text-earth">
              0% VERIFIED
            </span>
          </div>
        </div>

        {/* Interactive Center Stage: SVG Circuit Trajectory */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
          {/* Left: Circuit Vector (No heavy drop-shadow filter - R5) */}
          <div className="lg:col-span-6 relative h-[240px] md:h-[380px] flex items-center justify-center">
            <svg
              viewBox="0 0 600 420"
              className="w-full h-full"
            >
              {/* Dormant Background Track */}
              <path
                d={SVG_PATH_D}
                fill="none"
                stroke="#1b2230"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Active Drawn Path (pathLength 1 - R7) */}
              <path
                ref={pathRef}
                d={SVG_PATH_D}
                fill="none"
                stroke="#6fb6ff"
                strokeWidth="4"
                strokeLinecap="round"
                pathLength={1}
                data-scroll-driven
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                }}
              />

              {/* Stage Waypoint Nodes */}
              {STAGE_WAYPOINTS.map((wp, i) => (
                <g
                  key={i}
                  ref={(el) => {
                    if (el) waypointNodesRef.current[i] = el;
                  }}
                  data-active={i === 0 ? 'true' : 'false'}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="10"
                    fill="#05070c"
                    stroke="#2b3648"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="#8b95a5"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {wp.num}
                  </text>
                </g>
              ))}

              {/* Riding Compliance Token (R7) */}
              <circle
                ref={tokenRef}
                cx="60"
                cy="50"
                r="7"
                fill="#f2e6c9"
                stroke="#6fb6ff"
                strokeWidth="3"
                data-scroll-driven
              />
            </svg>
          </div>

          {/* Right: Stage Cards (No blur filters - R5, toggled via dataset - R2) */}
          <div className="lg:col-span-6 space-y-4">
            {SHOWCASE_CONTENT.pipeline.map((leg, index) => {
              const Icon = LEG_ICONS[index];

              return (
                <div
                  key={leg.id}
                  ref={(el) => {
                    if (el) stageCardsRef.current[index] = el;
                  }}
                  data-active={index === 0 ? 'true' : 'false'}
                  className="p-4 rounded-xl border border-borderMuted/80 bg-void/80 transition-opacity duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg border border-borderMuted bg-void text-earth">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-earth uppercase">
                          Stage {leg.number}
                        </span>
                        <h3 className="font-display text-sm md:text-base text-white font-normal">
                          {leg.title}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[9px] text-regolith/50 block uppercase">
                        {leg.metricLabel}
                      </span>
                      <span className="text-xs font-semibold text-white">{leg.metric}</span>
                    </div>
                  </div>

                  <p className="text-xs text-regolith/80 leading-relaxed mb-2.5">
                    {leg.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-borderMuted/40 font-mono text-[10px]">
                    <span className="text-regolith/50 uppercase">Sources:</span>
                    {leg.sourcesCited.map((source, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-1.5 py-0.5 rounded bg-borderMuted/60 text-earth text-[10px] border border-borderActive"
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

        {/* Footer Trajectory Hint */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-borderMuted/40 font-mono text-[11px] text-regolith/60">
          <div>CONTINUOUS VERIFICATION · SCROLL TO PROCEED</div>
          <div className="text-earth">GROUNDED CHECKS ONLY · NO INVENTED FACTS</div>
        </div>
      </div>
    </section>
  );
};
